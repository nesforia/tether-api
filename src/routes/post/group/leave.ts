import {app} from "../../../modules/express";
import AuthToken from "../../../utils/AuthToken";
import io from "../../../modules/socket";
import RoomCache from "../../../cache/rooms/RoomCache";
import Log from "../../../utils/Log";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import {ERoomUpdateAction} from '../../../types/enums/ERoomUpdateAction'
import UserCache from "../../../cache/user/UserCache";

Log.Debug("Route /group/leave loaded.")

interface Payload {
    id: string;
}

app.post('/group/leave', (req, res) => {
    const token = req.headers['x-auth-token'];

    const body = req.body as Payload;
    let roomOwnerChanged = false;

    try {
        const data = AuthToken.verify(token as string)

        if (!body || !body.id) {
            Log.Debug("Body wasnt provided for /group/leave")
            return res.status(500).send({})
        }

        const room = RoomCache.get(body.id)
        if (!room) {
            Log.Warning("User want to leave a room that not exist?")
            return res.status(500).send({})
        }

        RoomCache.removeParticipant(body.id, data.id)

        if (room.ownerId === data.id) {
            room.ownerId = room.participants[0] || "";
            roomOwnerChanged = true;
        }

        io.in(`user:${data.id}`).socketsLeave(`room:${body.id}`)

        io.in(`room:${body.id}`).emit(ESocketEvent.UPDATE_ROOM, {
            group: body.id,
            user: UserCache.get(data.id),
            action: ERoomUpdateAction.PARTICIPANT_LEAVE,
            payload: roomOwnerChanged ? room.ownerId : null,
        })

        if (room.participants.length === 0) {
            RoomCache.remove(room.id)
        }

        return res.status(200).send({})
    } catch (error: any) {
        Log.Debug(error.toString())
        return res.status(500).send({})
    }
})