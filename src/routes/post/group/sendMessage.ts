import {app} from "../../../modules/express";
import io from "../../../modules/socket";
import AuthToken from "../../../utils/AuthToken";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import Log from "../../../utils/Log";
import Validation from "../../../utils/Validation";

Log.Debug("Route /group/sendMessage loaded.")

interface Payload {
    id: string;
    message: string;
}

app.post('/group/sendMessage', (req, res) => {
    const token = req.headers['x-auth-token'];
    const body = req.body as Payload;

    try {
        const author = AuthToken.verify(token as string)

        if (!body || !body.message) {
            return res.status(500).send({})
        }

        if (!Validation.checkIfUserInRoom(author.id, body.id)) {
            return res.status(500).send({})
        }

        io.in(`room:${body.id}`).emit(ESocketEvent.SEND_GROUP_MESSAGE, {
            author,
            id: body.id,
            message: body.message
        })

        return res.status(200).send({})
    } catch(error) {
        return res.status(500).send({})
    }
})