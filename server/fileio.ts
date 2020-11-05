import * as express from 'express'
import * as dotenv from "dotenv";
import * as path from 'path';
import * as multer from "multer"
import * as fs from 'fs';
import { saveFile, fetchFromTable } from './db';

export const fileShareRoute = express.Router()


const storageFolder = 'storage'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.query.folder
        const subfolder = req.query.subfolder
        const dir = path.join(__dirname, `${process.env.STORAGE_ROOT}/${storageFolder}/${folder}/${subfolder}`)
        fs.exists(dir, exist => {
            if (!exist)
                return fs.mkdir(dir, { recursive: true }, error => cb(error, dir))
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
    const jobId = req.params.jobId
    const folder = req.query.folder
    const subfolder = req.query.subfolder
    const dbResponse = await saveFile(jobId, folder, subfolder, req['file'].filename, now.toISOString())
    // const jobFiles = await fetchFromTable('job_files', `Files for ${folder}`, { jobId: [jobId] })

    resp.send(dbResponse)
})

fileShareRoute.get('/download/:jobId/:fileName', async (req, res) => {
    try {
        const jobId = req.params.jobId
        const folder = req.query.folder
        const subfolder = req.query.subfolder
        const fileName = encodeURIComponent(req.params.fileName)
        res.download(path.join(__dirname, `${process.env.STORAGE_ROOT}/${storageFolder}/${folder}/${subfolder}/${fileName}`));
    } catch (e) {
        res.status(404).send(e)
    }
})


