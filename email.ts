import * as express from 'express'
import * as dotenv from "dotenv";
import * as path from 'path';
const sgMail = require('@sendgrid/mail')

export const emailRoute = express.Router()

emailRoute.post('/email', async (req, resp) => {
    dotenv.config({ path: path.join(__dirname, ".env") })
    console.log(req.body['message'])
    sgMail.setApiKey(process.env.SG_API_KEY);
    const msgConfig = {
        to: '6107304332@msg.fi.google.com',
        from: { "email": "example@example.com", "name": "Concrete Systems Help" },
        subject: 'Concrete Systems Help',
    };
    const message = { ...msgConfig, text: req.body['message'] }
    try {
        let msgResponse = await sgMail.send(message)
        console.log("Email Sent:", msgResponse[0].statusCode, new Date())
        resp.send({ message: "The Help Beacon has been activated!" })
    } catch (err) {
        console.log("ERROR", err.response.body.errors)
        resp.send({ error: "Error: " + err.response.body.errors })
    }
})