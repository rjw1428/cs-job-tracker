import * as express from 'express'
import * as dotenv from "dotenv";
import * as path from 'path';
import * as multer from "multer"
import * as fs from 'fs';
import { saveFile } from './database/db';


export const fileShareRoute = express.Router()

const storageFolder = 'storage'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subfolder = req.params.jobId
        const dir = path.join(__dirname, `${storageFolder}/${subfolder}`)
        fs.exists(dir, exist => {
            if (!exist)
                return fs.mkdir(dir, error => cb(error, dir))
            return cb(null, dir)
        })
    },
    filename: (req, file, cb) => {
        cb(null, `${encodeURIComponent(file.originalname)}`);
    }
});

const upload = multer({ storage: storage })

fileShareRoute.post('/upload/:jobId', upload.single('document'), async (req, resp) => {
    const now = new Date()
    console.log(req.body)
    saveFile(req.params.jobId, req['file'].filename, now.toISOString(), async (dbResult: any) => {
        if (dbResult.error)
            resp.status(500).send({ error: dbResult.error })
        resp.send(dbResult)
    })

})


fileShareRoute.get('/download/:jobId/:fileName', async (req, res) => {
    try {
        const jobId = req.params.jobId
        const fileName = encodeURIComponent(req.params.fileName)
        res.download(path.join(__dirname, `${storageFolder}/${jobId}/${fileName}`));
    } catch (e) {
        res.status(404).send(e)
    }
})