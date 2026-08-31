import express from 'express'
import { createServer } from 'node:http'
import rateLimit from "express-rate-limit";

const app = express();

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Slow down, cowboy~'}
})

app.use(globalLimiter)
app.use(express.json());
app.set('trust proxy', true);

const server = createServer(app)

export {
    server,
    app
}