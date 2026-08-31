import UserCache from "../cache/user/UserCache";
import RoomCache from "../cache/rooms/RoomCache";

export default {
    checkIfUserInRoom(userId: string, roomId: string) {
        const user = UserCache.get(userId);

        if (!user) {
            return false;
        }

        const room = RoomCache.get(roomId);
        if (!room) {
            return false;
        }

        return !!room.participants.find(s => s === user.id)
    }
}