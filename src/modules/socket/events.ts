import io from "./index";
import Log from "../../utils/Log";
import AuthToken from "../../utils/AuthToken";
import RoomCache from "../../cache/rooms/RoomCache";
import {ERoomUpdateAction} from "../../types/enums/ERoomUpdateAction";
import {ESocketEvent} from "../../types/enums/ESocketEvent";
import UserCache from "../../cache/user/UserCache";

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        Log.Debug("User tried to authenticate without token.")
        return next(new Error('Authentication failed'));
    }

    try {
        socket.data.user = AuthToken.verify(token);
        Log.Debug("Token authorization success")
        next()
    } catch(err) {
        Log.Debug("Authorization failed with token. Token failed.")
        next(new Error('Invalid token'))
    }
})

io.on("connection", (socket) => {
    const user = socket.data.user
    Log.Debug(`Received new connection from ${user.firstName} ${user.lastName}`)

    socket.join(`user:${user.id}`)

    socket.on("disconnect", () => {
        Log.Debug(`Closed connection from ${user.firstName} ${user.lastName}`);

        for (const [groupId, room] of RoomCache.cache.entries()) {
            if (!room.participants.includes(user.id)) continue;

            RoomCache.removeParticipant(groupId, user.id);

            io.in(`room:${groupId}`).emit(ESocketEvent.UPDATE_ROOM, {
                group: groupId,
                user,
                action: ERoomUpdateAction.PARTICIPANT_LEAVE,
            });

            if (room.participants.length === 0) {
                RoomCache.remove(groupId);
            }
        }

        UserCache.remove(user.id)
    })
})