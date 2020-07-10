import * as express from 'express'
import * as cors from 'cors'
import * as path from 'path';
import { Application } from "express";
import { createServer } from 'http'
import { router } from './database/db'
import { emailRoute } from './email'

//npm install --save-dev ts-node nodemon cors
const port = process.env.PORT || 9000
const app: Application = express();
const server = createServer(app)
const distDir = path.join(__dirname, "../dist/cs-work-tracker");
app.use(cors())
app.use(express.json())
app.use(router)
app.use(emailRoute)
app.use(express.static(distDir));

server.listen(port, () => {
    console.log(`Server has started on port ${port}`)
})
