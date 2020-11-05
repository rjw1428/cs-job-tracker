import * as express from 'express'
import * as path from 'path';
import * as dotenv from "dotenv";
import * as admin from 'firebase-admin'
import { pingDB, injectScript } from './db';
import { ReportConfig } from '../cs-front-end/src/models/reportConfig';
import { ChartConfig } from '../cs-front-end/src/models/chartConfig';
import { RawTimeShortcut } from '../cs-front-end/src/models/rawtimeShortcut';
import { DashboardColumn } from '../cs-front-end/src/models/dashboardColumn';
import { initializeBackend } from './server';

export const firebaseRoute = express.Router()
dotenv.config({ path: path.join(__dirname, "../.env") })

const env = process.env.ENVIRONMENT.toLowerCase() == 'dev'
    ? process.env.FIREBASE_COLLECTION + "_test"
    : process.env.FIREBASE_COLLECTION

var serviceAccount = require(path.join(__dirname, "../firebaseServiceAccount.json"));

console.log("Using Env Parameters")
if (process.env.ENVIRONMENT && process.env.ENVIRONMENT.toLowerCase() == 'dev')
    console.log({
        host: process.env.DB_HOST_DEV,
        user: process.env.DB_USER_DEV,
        password: process.env.DB_PASSWORD_DEV,
        database: process.env.DB_SCHEMA_DEV,
        firebaseCollection: env
    })
else
    console.log({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA,
        firebaseCollection: env
    })

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databaseURL
})

admin.auth().createCustomToken("concrete-systems")
    .then((customToken) => {
        console.log("custom login token created")
        logServerStartTime()
        initializeBackend()
        pollForSqlInjection()
        pingLocaldabase()
        setInterval(() => {
            pollForSqlInjection()
            pingLocaldabase()
        }, 60 * 1000)
    })
    .catch((error) => console.log('Error creating custom token:', error));


export const fetchInitialFirebaseConfigs = async () => {
    // Get Reports
    const reports = await admin.firestore().collection(env).doc('reports').get()
    if (!reports.exists) console.log('No reports found!');
    const reportConfigs: ReportConfig[] = reports.exists
        ? Object.keys(reports.data())
            .map(key => reports.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
        : []
    // Get Charts
    const charts = await admin.firestore().collection(env).doc('charts').get()
    if (!charts.exists) console.log('No charts found!');
    const chartConfigs: ChartConfig[] = charts.exists
        ? Object.keys(charts.data())
            .map(key => charts.data()[key])
            .sort((a, b) => a.order ? a.order - b.order : -1)
        : []
    //Get time filters
    const time_filter = await admin.firestore().collection(env).doc('time_filter').get()
    if (!time_filter.exists) console.log('No time filters found!');
    const timeShortcuts: RawTimeShortcut[] = time_filter.exists
        ? Object.keys(time_filter.data())
            .map(key => time_filter.data()[key])
        : []

    //Get dashboard columns
    const dashboard_columns = await admin.firestore().collection(env).doc('dashboard_columns').get()
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
    const sqlDoc = await admin.firestore().collection(env).doc('sql-injection').get()
    if (!sqlDoc.data().new || !sqlDoc.data().new.value) return
    await executeSqlInjection(sqlDoc.data())
}

async function executeSqlInjection(injectionData) {
    const resp = await injectScript(injectionData.new.value)
    const updatedOld = [{ response: JSON.stringify(resp), value: injectionData.new.value, timestamp: createTime() }]
        .concat(injectionData.old)
    admin.firestore().collection(env).doc('sql-injection')
        .update({ new: { value: '' }, old: updatedOld })
}


function pingLocaldabase() {
    pingDB((resp) => {
        if (resp.results)
            logToFirebase()
        else {
            console.log("FIREBASE")
            logErrorToFirebase("Unable to connect to DB")
        }
    })
}

function logServerStartTime() {
    admin.database().ref(env + '/started').once('value').then(resp => {
        admin.database().ref(env + '/').update({
            started: resp.val()
                ? [resp.val()].concat([createTime()])
                : [createTime()]
        })
    })
}

function logToFirebase() {
    admin.database().ref(env + '/mysql').set({ lastOnline: createTime() })
}

function logErrorToFirebase(error) {
    admin.database().ref(env + '/').set({ error, errorTime: createTime() })
}

function createTime() {
    const d = new Date()
    return d.toLocaleDateString() + " " + d.toLocaleTimeString()
}