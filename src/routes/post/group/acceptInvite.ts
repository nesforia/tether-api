import {app} from "../../../modules/express";
import AuthToken from "../../../utils/AuthToken";
import RoomCache from "../../../cache/rooms/RoomCache";
import io from "../../../modules/socket";
import Log from "../../../utils/Log";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import UserCache from "../../../cache/user/UserCache";
import {ERoomUpdateAction} from "../../../types/enums/ERoomUpdateAction";
import InviteCache from "../../../cache/invites/InviteCache";

Log.Debug("Route /group/acceptInvite loaded.")

interface Payload {
    id: string;
}

app.post("/group/acceptInvite", (req, res) => {
    const token = req.headers['x-auth-token'];
    const body = req.body as Payload;

    try {
        const data = AuthToken.verify(token as string)

        if (!body || !body.id) {
            Log.Debug("No body in /group/acceptInvite");
            return res.status(500).send({})
        }

        const group = RoomCache.get(body.id);
        if (!group) {
            Log.Warning("User accepted ID for room that doesnt exist?");
            return res.status(500).send({})
        }

        const pending = InviteCache.getByRecipient(data.id, body.id);
        if (!pending) {
            Log.Warning("Tried to accept a group invite with no matching pending invite");
            return res.status(500).send({});
        }
        InviteCache.remove(pending);

        if (!group.participants.includes(data.id)) {
            group.participants.push(data.id)
        }

        io.in(`room:${body.id}`).emit(ESocketEvent.UPDATE_ROOM, {
            group: body.id,
            user: UserCache.get(data.id),
            action: ERoomUpdateAction.PARTICIPANT_JOIN
        })

        io.in(`user:${data.id}`).socketsJoin(`room:${body.id}`)

        return res.status(200).send({
            group: body.id,
            participants: group.participants.map(s => UserCache.get(s)),
            ownerId: group.ownerId
        })
    } catch (error) {
        return res.status(500).send({})
    }
})