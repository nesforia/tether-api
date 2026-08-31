import {configDotenv} from "dotenv";
import {server} from "./modules/express";
import Log from "./utils/Log";

configDotenv()

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

// Socket
import './modules/socket/events'

// Routes
import './routes/index'

server.listen(process.env.SERVER_PORT || 3000, () => {
    Log.Info(`Server start on port ${process.env.SERVER_PORT}`)
})