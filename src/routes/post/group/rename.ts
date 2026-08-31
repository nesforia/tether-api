import {app} from "../../../modules/express";
import AuthToken from "../../../utils/AuthToken";
import RoomCache from "../../../cache/rooms/RoomCache";
import io from "../../../modules/socket";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import {ERoomUpdateAction} from "../../../types/enums/ERoomUpdateAction";
import Log from "../../../utils/Log";

Log.Debug("Route /group/rename loaded.")

interface Payload {
    groupId: string;
    newName: string;
}

app.post("/group/rename", (req, res) => {

    const token = req.headers['x-auth-token'];

    const payload: Payload = req.body;

    try {
        const user = AuthToken.verify(token as string)

        if (!payload || !payload.groupId || !payload.newName) {
            return res.status(500).send({})
        }

        const chat = RoomCache.get(payload.groupId);
        if (!chat) {
            return res.status(500).send({})
        }

        if (chat.ownerId !== user.id) {
            return res.status(500).send({})
        }

        chat.name = payload.newName;

        io.in(`room:${payload.groupId}`).emit(ESocketEvent.UPDATE_ROOM, {
            group: payload.groupId,
            payload: payload.newName,
            action: ERoomUpdateAction.GROUP_NAME_CHANGE
        });

        return res.status(200).send({})

    } catch (err) {
        return res.status(500).send({})
    }
})