import * as express from 'express'
import * as path from 'path';
import * as firebase from 'firebase'
import * as dotenv from "dotenv";
import * as admin from 'firebase-admin'

export const firebaseRoute = express.Router()

dotenv.config({ path: path.join(__dirname, ".env") })
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};
let fb = firebase.initializeApp(firebaseConfig)
var serviceAccount = require(path.join(__dirname, "firebaseServiceAccount.json"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databaseURL
});

admin.auth().createCustomToken("concrete-systems")
    .then((customToken) => {
        console.log("custom login token created")
        fb.auth().signInWithCustomToken(customToken)
            .then(() => console.log("token login complete"))
            .catch(error => console.log("Error logging in with custom token: ", error))
    })
    .catch((error) => console.log('Error creating custom token:', error));

fb.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User:", user.uid)
        logToFirebase()
        setInterval(() => {
            logToFirebase()
        }, 60 * 1000)
    } else {
        // No user is signed in.
    }
});

firebaseRoute.get('/init', async (req, resp) => {
    let reportConfigs = []
    let chartConfigs = []
    const reports = await fb.firestore().collection('cs_workflow').doc('reports').get()
    if (!reports.exists) {
        console.log('No reports found!');
    }
    else {
        reportConfigs = Object.keys(reports.data())
            .map(key => reports.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
    }
    const charts = await fb.firestore().collection('cs_workflow').doc('charts').get()
    if (!charts.exists) {
        console.log('No charts found!');
    }
    else {
        chartConfigs = Object.keys(charts.data())
            .map(key => charts.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
    }

    resp.send({
        reports: reportConfigs,
        charts: chartConfigs
    })
})


// firebaseRoute.get('/download/:jobId/:fileName', async (req, res) => {
//     try {
//         const jobId = req.params.jobId
//         const folder = req.query.folder
//         const fileName = encodeURIComponent(req.params.fileName)
//         res.download(path.join(__dirname, `${storageFolder}/${folder}/${fileName}`));
//     } catch (e) {
//         res.status(404).send(e)
//     }
// })

function logToFirebase() {
    fb.firestore().collection('cs_workflow').doc('node-status').set({ lastOnline: new Date() })
}