import * as express from 'express'
import * as path from 'path';
import * as firebase from 'firebase'
import * as dotenv from "dotenv";
import * as admin from 'firebase-admin'
import { pingDB } from './database/db';

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

// Node Heartbeat    
fb.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User:", user.uid)
        logToFirebase('node-status')
        pingLocaldabase()
        setInterval(() => {
            logToFirebase('node-status')
            pingLocaldabase()
        }, 60 * 1000)
    } else {
        // No user is signed in.
    }
});

firebaseRoute.get('/init', async (req, resp) => {
    let reportConfigs = []
    let chartConfigs = []
    let timeShortcuts = []
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
    const time_filter = await fb.firestore().collection('cs_workflow').doc('time_filter').get()
    if (!time_filter.exists) {
        console.log('No time filters found!');
    }
    else {
        timeShortcuts = Object.keys(time_filter.data())
            .map(key => time_filter.data()[key])
    }
    resp.send({
        reports: reportConfigs,
        charts: chartConfigs,
        timeShortcuts
    })
})

function pingLocaldabase() {
    pingDB((resp) => {
        if (resp.results)
            logToFirebase('mysql-status')
        else 
            logErrorToFirebase('mysql-status', "Unable to connect to DB")
    })
}

function logToFirebase(document) {
    fb.firestore().collection('cs_workflow').doc(document).update({ lastOnline: new Date() })
}

function logErrorToFirebase(document, error) {
    fb.firestore().collection('cs_workflow').doc(document).update({ error, errorTime: new Date() })
}