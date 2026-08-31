import {IPlayerState} from "../types/interface/IPlayerState";
import jwt from 'jsonwebtoken'

export default {
    verify (token: string) {
        if (!token) throw new Error("Token is missing");
        try {
            return jwt.verify(token, process.env.JWT_SECRET!) as IPlayerState
        } catch (err) {
            throw err;
        }
    },
    create (player: IPlayerState, payload?: object){
        if (!player) throw new Error("User details is missing");
        try {
            return jwt.sign({
                ...player,
                ...payload
            }, process.env.JWT_SECRET!, {
                expiresIn: '12h'
            })
        } catch (err) {
            throw err;
        }
    }
}