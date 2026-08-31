import {Server} from "socket.io";
import {server} from "../express";


const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

export default io;