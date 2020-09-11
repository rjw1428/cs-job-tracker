import * as express from 'express'
import * as path from 'path';
import * as firebase from 'firebase'
import * as dotenv from "dotenv";
import * as admin from 'firebase-admin'
import { pingDB, injectScript } from './db';
import { ReportConfig } from './cs-front-end/src/models/reportConfig';
import { ChartConfig } from './cs-front-end/src/models/chartConfig';
import { TimeShortcut } from './cs-front-end/src/models/timeShortcut';
import { DashboardColumn } from './cs-front-end/src/models/dashboardColumn';
import { initializeBackend } from './server';

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
            .then(async () => {
                console.log("token login complete")
                initializeBackend()
            })
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
            pollForSqlInjection()
            logToFirebase('node-status')
            pingLocaldabase()
        }, 60 * 1000)
    } else {
        // No user is signed in.
    }
});

export const fetchInitialFirebaseConfigs = async () => {
    // Get Reports
    const reports = await fb.firestore().collection('cs_workflow').doc('reports').get()
    if (!reports.exists) console.log('No reports found!');
    const reportConfigs: ReportConfig[] = reports.exists
        ? Object.keys(reports.data())
            .map(key => reports.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
        : []
    // Get Charts
    const charts = await fb.firestore().collection('cs_workflow').doc('charts').get()
    if (!charts.exists) console.log('No charts found!');
    const chartConfigs: ChartConfig[] = charts.exists
        ? Object.keys(charts.data())
            .map(key => charts.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
        : []
    //Get time filters
    const time_filter = await fb.firestore().collection('cs_workflow').doc('time_filter').get()
    if (!time_filter.exists) console.log('No time filters found!');
    const timeShortcuts: TimeShortcut[] = time_filter.exists
        ? Object.keys(time_filter.data())
            .map(key => time_filter.data()[key])
        : []

    //Get dashboard columns
    const dashboard_columns = await fb.firestore().collection('cs_workflow').doc('dashboard_columns').get()
    if (!dashboard_columns.exists) console.log('No dashboard column configs found!');
    const dashboardColumn: DashboardColumn[] = dashboard_columns.exists
        ? Object.keys(dashboard_columns.data())
            .map(key => dashboard_columns.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
        : []
    return Promise.all([reportConfigs, chartConfigs, timeShortcuts, dashboardColumn])
}


async function pollForSqlInjection() {
    console.log("Polling for SQL")
    const sqlDoc = await fb.firestore().collection('cs_workflow').doc('sql-injection').get()
    if (!sqlDoc.data().new || !sqlDoc.data().new.value) return
    await executeSqlInjection(sqlDoc.data())
}

async function executeSqlInjection(injectionData) {
    const resp = await injectScript(injectionData.new.value)
    const updatedOld = [{ response: JSON.stringify(resp), value: injectionData.new.value, timestamp: new Date().toLocaleString() }]
        .concat(injectionData.old)
    fb.firestore().collection('cs_workflow').doc('sql-injection')
        .update({ new: { value: '' }, old: updatedOld })
}


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