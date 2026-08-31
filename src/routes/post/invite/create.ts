import {app} from "../../../modules/express";
import {IPlayerState} from "../../../types/interface/IPlayerState";
import AuthToken from "../../../utils/AuthToken";
import UserCache from "../../../cache/user/UserCache";
import io from "../../../modules/socket";
import {ESocketEvent} from "../../../types/enums/ESocketEvent";
import Log from "../../../utils/Log";
import InviteCache from "../../../cache/invites/InviteCache";

interface Payload {
    id: string;
}

Log.Debug("Route /invite loaded.")

app.post("/invite", (req, res) => {
    const body: Payload = req.body;
    const token = req.headers['x-auth-token'] as string

    if (!body.id) {
        Log.Debug("No id provided for body with invite/create route.")
        return res.status(500).send({})
    }

    try {
        const data: IPlayerState = AuthToken.verify(token)
        const getReceiver = UserCache.get(body.id)

        if (!getReceiver) {
            Log.Warning("No receiver found with ID", body.id)
            return res.status(500).send({})
        }

        if (data.id === getReceiver.id) {
            Log.Warning("User is trying to invite themselves? ID for", data.id, getReceiver.id)
            return res.status(500).send({})
        }

        io.in(`user:${getReceiver.id}`).emit(ESocketEvent.SEND_GROUP_REQUEST, {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            world: data.world
        })

        InviteCache.set({ from: data.id, to: getReceiver.id })

        return res.status(200).send({})
    } catch (err) {
        return res.status(401).send({})
    }

})