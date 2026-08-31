import {app} from "../../../modules/express";
import AuthToken from "../../../utils/AuthToken";
import Log from "../../../utils/Log";
import {IGroup} from "../../../types/interface/IGroup";
import {randomUUID} from "node:crypto";
import RoomCache from "../../../cache/rooms/RoomCache";
import io from "../../../modules/socket";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import UserCache from "../../../cache/user/UserCache";
import InviteCache from "../../../cache/invites/InviteCache";

Log.Debug("Route /group/create loaded.")

interface Payload {
    from: string
}

app.post("/group/create", (req, res) => {

    const token = req.headers['x-auth-token'];

    try {
        const user = AuthToken.verify(token as string)

        const payload: Payload = req.body;

        if (!payload || !payload.from) {
            Log.Debug("No provided from request in /group/create")
            return res.status(500).send({})
        }

        const pending = InviteCache.get(payload.from, user.id)
        if (!pending) {
            Log.Warning("Tried to /group/create without a matching pending invite!")
            return res.status(500).send({})
        }
        InviteCache.remove(pending)

        const chatId = randomUUID()
        const chat: IGroup = {
            id: chatId,
            name: "Group chat",
            participants: [user.id, payload.from],
            ownerId: payload.from
        }
        RoomCache.set(chat)

        Log.Info("New chat created with ID: ", chat.id)

        io.in([`user:${user.id}`, `user:${payload.from}`]).socketsJoin(`room:${chatId}`)

        io.in(`room:${chatId}`).emit(ESocketEvent.ACCEPT_GROUP_REQUEST, {
            id: chatId,
            name: "Group chat",
            participants: [UserCache.get(user.id), UserCache.get(payload.from)],
            ownerId: payload.from
        })

        return res.status(200).send(chat.id)
    } catch (error) {
        return res.status(500).send({})
    }
})