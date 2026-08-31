import {app} from "../../../modules/express";
import {IPlayerState} from "../../../types/interface/IPlayerState";
import AuthToken from "../../../utils/AuthToken";
import Log from "../../../utils/Log";
import UserCache from "../../../cache/user/UserCache";
import {randomBytes} from "node:crypto";

Log.Debug("Route /auth loaded.")

app.post("/auth", (req, res) => {
    const body: IPlayerState = req.body;

    if (!body) {
        Log.Debug("Auth body is empty.")
        return res.status(400).send({})
    }

    if (!body.firstName || !body.lastName || !body.id || !body.world) {
        Log.Debug("Missing one of the body type for auth body.")
        return res.status(400).send({})
    }

    body.usercode = randomBytes(8).toString("hex")

    if (UserCache.get(body.id)) {
        Log.Warning("Someone want to generate user credentials on account that exist!")
        return res.status(400).send({})
    }

    const token = AuthToken.create(body)
    UserCache.set(body)

    Log.Info("Generated new token for person", body.firstName, body.lastName)

    return res.status(200).send({ token, usercode: body.usercode })
})