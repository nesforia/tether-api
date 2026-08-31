import {app} from "../../../modules/express";
import AuthToken from "../../../utils/AuthToken";
import io from "../../../modules/socket";
import UserCache from "../../../cache/user/UserCache";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import RoomCache from "../../../cache/rooms/RoomCache";
import Log from "../../../utils/Log";
import Validation from "../../../utils/Validation";
import InviteCache from "../../../cache/invites/InviteCache";

Log.Debug("Route /group/invite loaded.")

interface Payload {
    id: string,
    to: string
}

app.post("/group/invite", (req, res) => {
    const token = req.headers['x-auth-token'];

    const body = req.body as Payload;

    try {
        const data = AuthToken.verify(token as string)

        if (!body || !body.id || !body.to) {
            return res.status(500).send({})
        }

        const to = UserCache.get(body.to)
        if (!to) {
            Log.Warning("User not found with ID:", body.id, "on /group/invite");
            return res.status(500).send({})
        }

        const room = RoomCache.get(body.id)
        if (!room) {
            Log.Warning("Room not found with ID:", body.id, "on /group/invite");
            return res.status(500).send({})
        }

        if (Validation.checkIfUserInRoom(body.to, body.id)) {
            return res.status(500).send({})
        }

        if (!Validation.checkIfUserInRoom(data.id, body.id)) {
            return res.status(500).send({})
        }

        io.in(`user:${body.to}`).emit(ESocketEvent.INVITE_TO_GROUP, {
            id: body.id,
            firstName: data.firstName,
            lastName: data.lastName
        })

        InviteCache.set({ from: data.id, to: body.to, groupId: body.id})

        return res.status(200).send({})
    } catch (error) {
        return res.status(500).send({})
    }
})