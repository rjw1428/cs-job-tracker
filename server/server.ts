import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import * as socketio from 'socket.io';
import { Application } from "express";
import { createServer } from 'http'
import { emailRoute } from './email'
import { fileShareRoute } from './fileio';
import { firebaseRoute, fetchInitialFirebaseConfigs } from './firebase';
import { fetchInitialSQLData, insertIntoTable, fetchFromTable, updateTable, runStoredProcedure, runSearch, runQuery, deleteFromTable } from './db';
import { Contractor } from '../cs-front-end/src/models/contractor'
import { Project } from '../cs-front-end/src/models/project'
import { Estimator } from '../cs-front-end/src/models/estimator'
import { EstimateType } from '../cs-front-end/src/models/estimateType';
import { BoxOption } from '../cs-front-end/src/models/boxOption'
import { ReportConfig } from '../cs-front-end/src/models/reportConfig';
import { ChartConfig } from '../cs-front-end/src/models/chartConfig';
import { RawTimeShortcut } from '../cs-front-end/src/models/rawtimeShortcut';
import { DashboardColumn } from '../cs-front-end/src/models/dashboardColumn';
import { Job } from '../cs-front-end/src/models/job'
import { AttachedFile } from '../cs-front-end/src/models/attachedFile'
import { StatusOption } from '../cs-front-end/src/models/statusOption';
import { Estimate } from '../cs-front-end/src/models/estimate';
import { Proposal } from '../cs-front-end/src/models/proposal';

const port = process.env.PORT || 9000
const app: Application = express();
const server = createServer(app)
const io = socketio.listen(server)
const distDir = path.join(__dirname, "../dist");

// State Endpoint
const router = express.Router()
router.get('/api/state/:key', (req, resp) => {
    const key = req.params.key
    const filters = Object.keys(req.query)
    if (key == 'invites') {
        if (!filters.length) return resp.send(state.invites)
        if (filters.length == 1 && filters[0] == 'jobId') {
            const id = +req.query[filters[0]]
            return resp.send(state.invites[id])
        }
        else {
            const invitesFiltered = Object.values(state.invites).filter(obj => {
                return filters
                    .map(filter => obj[filter] == req.query[filter])
                    .reduce((acc, cur) => acc && cur, true)
            })
            return resp.send(invitesFiltered)
        }
    }
    else {
        if (!state[key]) return resp.send("Key Not In State")
        const result = filters.length
            ? state[key].filter(obj => {
                return filters
                    .map(filter => obj[filter] == req.query[filter])
                    .reduce((acc, cur) => acc && cur, true)
            })
            : state[key]
        return resp.send(result)
    }
})

app.use(cors())
app.use(express.json())
app.use(router)
app.use(firebaseRoute)
app.use(emailRoute)
app.use(fileShareRoute)
app.use(express.static(distDir));

// I DONT THINK THIS WORKS
app.get('*', (req, res) => {
    console.log("HERE")
    res.sendFile(path.resolve(distDir, 'index.html'));
});

let room = "estimators"
let refreshInterval
let state: {
    users: any[],
    estimators: Estimator[],
    estimateTypes: EstimateType[],
    boxOptions: BoxOption[],
    invites: { [id: number]: Job },
    reportConfigs: ReportConfig[],
    chartConfigs: ChartConfig[],
    timeShortcuts: RawTimeShortcut[],
    dashboardColumns: DashboardColumn[],
    fileTypes: any[]
} = {
    users: [],
    estimators: [],
    estimateTypes: [],
    boxOptions: [],
    invites: [],
    reportConfigs: [],
    chartConfigs: [],
    timeShortcuts: [],
    dashboardColumns: [],
    fileTypes: [],
}


// Initialize backend data (runs after firebase auth finishes)
export async function initializeBackend() {
    doInitialization()
    refreshInterval = setInterval(async () => {
        try {
            doInitialization()
        } catch (e) {
            console.log(e)
        }
    }, 1000 * 60)
}

async function doInitialization() {
    let rawInvites: Job[]
    [state.estimators, state.estimateTypes, state.boxOptions, rawInvites, state.fileTypes] = await fetchInitialSQLData()
    console.log("MYSQL Data Initialized")
    const [report, chart, time, dash] = await fetchInitialFirebaseConfigs()
    console.log("Firebase Data Initialized")
    state.reportConfigs = report
    state.chartConfigs = chart
    state.timeShortcuts = time

    // Convert invites to an Obj
    state.invites = rawInvites
        .map(invite => ({ [invite.jobId]: invite }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
    const options = await Promise.all(dash.map(column => fetchFromTable(`status_options_${column.id}`, `${column.id} status options`)))

    state.dashboardColumns = dash.map((column, i) => ({
        ...column,
        statusOptions: options[i]
    }))
}

io.on('connection', (socket) => {
    
    socket.join(room)
    state.users.push({ id: socket.id, room })
    console.log("Users: " + state.users.filter(user => user.room == room).length)

    // -------------Dashboard---------------------------------------
    // On Dashboard Init
    socket.on('dashboard', (callback) => {
        socket.emit('getEstimators', state.estimators)
        socket.emit('getBoxOptions', state.boxOptions)
        socket.emit('getColumns', state.dashboardColumns)
        socket.emit('getReportConfigs', state.reportConfigs)
        socket.emit('getInvites', state.invites)

    })

    // On Bid Form Init
    socket.on('bidFormInit', async () => {
        const [contractors, projects] = await Promise.all([
            fetchFromTable('general_contractors', "Contractors"),
            fetchFromTable('projects', "Projects")
        ])
        socket.emit('getContractors', contractors)
        socket.emit('getProjects', projects)
    })

    socket.on('searchInit', () => {
        socket.emit('getBoxOptions', state.boxOptions)
        socket.emit('getColumns', state.dashboardColumns)
    })

    // On Bid Form Init
    socket.on('estimateFormInit', async () => {
        socket.emit('getEstimateTypes', state.estimateTypes)
    })

    // View File Form Init
    socket.on('viewFilesInit', async (job: Job) => {
        try {
            const jobFiles = await fetchFromTable('job_files', `Files for ${job.jobDisplayId}`, { jobId: [job.jobId], isActive: [1] })
            socket.emit('getFiles', { job, jobFiles })
        }
        catch (e) {
            console.log(e)
        }
    })

    // View Single Proposal Form Init
    socket.on('proposalFormInit', async ({ proposalId, job }) => {
        try {
            const rawProposal = await fetchFromTable('proposal_snapshot', `Proposal ${proposalId} for ${job.jobDisplayId}`, { id: [proposalId] })
            const proposal = packageProposal(rawProposal).pop()
            socket.emit('getSingleProposal', { job, proposal })
        }
        catch (e) {
            console.log(e)
        }
    })

    // Add File Form Init
    socket.on('addFileFormInit', () => {
        const types = state.fileTypes.map(obj => obj.subfolderName)
        socket.emit('getFileTypes', types)
    })

    // View Single Proposal Form Init
    socket.on('proposalHistoryFormInit', async (job: Job) => {
        try {
            const rawProp = await fetchFromTable('proposal_snapshot', `Proposal History for ${job.jobDisplayId}`, { jobId: [job.jobId] })
            const currentEstimates = await fetchFromTable('proposal_current', `Current Proposal for ${job.jobDisplayId}`, { jobId: [job.jobId] })
            const currentProp = job.currentDashboardColumn == 'estimating'
                ? {
                    id: null,
                    estimates: currentEstimates,
                    dateSent: 'current',
                    projectValue: currentEstimates.map(prop => +prop.cost).reduce((a, b) => a += b, 0),
                    outsourceCost: currentEstimates.map(prop => +prop.fee).reduce((a, b) => a += b, 0),
                    finalCost: null,
                    finalCostNote: null
                }
                : []
            const proposals = packageProposal(rawProp).concat(currentProp)
            socket.emit('getProposalHistory', { job, proposals })
        }
        catch (e) {
            console.log(e)
        }
    })


    // View Job History Form Init
    socket.on('jobHistoryFormInit', async (job: Job) => {
        try {
            const transactions = await fetchFromTable('job_history', `History for ${job.jobDisplayId}`, { jobId: [job.jobId] })
            socket.emit('getHistory', { job, transactions })
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('snapshotProposal', async (job: Job, callback) => {
        try {
            const estimates = await fetchFromTable('proposal_current', `Proposals for ${job.jobDisplayId}`, { jobId: [job.jobId] })
            const ids = estimates.map((estimate: Estimate) => ({ [estimate.type + 'Id']: estimate.estimateId })).reduce((acc, cur) => ({ ...acc, ...cur }), {})
            const entry = { ...ids, jobId: job.jobId, isActive: 1, dateSent: new Date().toLocaleString() }
            callback(await insertIntoTable('map_proposals_sent', entry))
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('setFinalCost', async ({ finalCost, job }) => {
        try {
            await insertIntoTable('job_final_cost', finalCost)
            emitUpdatedJob(job.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('awardTimeline', async (job: Job) => {
        try {
            const entry = {
                jobId: job.jobId,
                startTime: job.startTime,
                endTime: job.endTime
            }
            const resp = await insertIntoTable('awards_timeline', entry)
            emitUpdatedJob(job.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('updateTimeline', async (job: Job) => {
        try {
            const entry = { startTime: job.startTime, endTime: job.endTime }
            const resp = await updateTable('awards_timeline', entry, { jobId: job.jobId }, "Award Timeline")
            emitUpdatedJob(job.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })


    socket.on('updateDueDate', async (job: Job) => {
        try {
            const resp = await updateTable('bid_invites', { dateDue: job.dateDue }, { jobId: job.jobId }, "Due Date")
            await writeJobTransaction({...job, historyOnlyNotes: "Due Date Updated"})
            emitUpdatedJob(job.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('updateTargetDate', async (job: Job) => {
        try {
            const resp = await updateTable('bid_invites', { dateTarget: job.dateTarget }, { jobId: job.jobId }, "Target Turnaround Date")
            await writeJobTransaction({...job, historyOnlyNotes: "Target Turnaround Date Updated"})
            emitUpdatedJob(job.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })


    socket.on('addFiles', async (job: Job) => {
        const updatedJob = await fetchFromTable('bid_dashboard', "Bid Invites", { jobId: job.jobId })
        emitUpdatedJob(job.jobId)
    })

    socket.on('addEstimator', async (newEstimator, callback) => {
        try {
            const newId = await insertIntoTable('estimators', newEstimator)
            const updatedEstimator = { id: newId, ...newEstimator }
            state.estimators = await fetchFromTable('estimators', "Estimators")
            io.to(room).emit('getEstimators', state.estimators)
            callback(updatedEstimator)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('updateEstimator', async (updatedEstimator, callback) => {
        await updateTable('estimators', { isActive: updatedEstimator.isActive }, { id: updatedEstimator.id }, "Estimators")
        state.estimators = await fetchFromTable('estimators', "Estimators")
        io.to(room).emit('getEstimators', state.estimators)
    })

    socket.on('addContractor', async (newContractor, callback) => {
        try {
            const newId = await insertIntoTable('general_contractors', newContractor)
            const updatedContractor = { contractorId: newId, ...newContractor }
            const contractors = await fetchFromTable('general_contractors', "Contractors")
            io.to(room).emit('getContractors', contractors)
            callback(updatedContractor)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('addProject', async (newProject, callback) => {
        try {
            const newId = await insertIntoTable('projects', newProject)
            const updatedProject = { projectId: newId, ...newProject }
            const projects = await fetchFromTable('projects', "Projects")
            io.to(room).emit('getProjects', projects)
            callback(updatedProject)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('addInvite', async (newInvite, callback) => {
        try {
            const newId = await insertIntoTable('bid_invites', { ...newInvite, lastMoveDate: new Date().toLocaleString() })
            const updatedInvite = { jobId: newId, ...newInvite }
            const initTransaction = {
                jobId: updatedInvite.jobId,
                date: new Date().toLocaleString(),
                statusId: state.dashboardColumns.find(col => col.id == 'invitation').defaultStatusId
            }
            const transactionId = await insertIntoTable('job_transactions', initTransaction)
            emitUpdatedJob(newId)
            callback(updatedInvite)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('updateContact', async (updatedJob, callback) => {
        try {
            const resp = await updateTable('bid_invites', { contractorId: updatedJob.contractorId }, { jobId: updatedJob.jobId }, `Updated GC Info for ${updatedJob.jobId}`)
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('updateProject', async (updatedJob, callback) => {
        try {
            const resp = await updateTable('bid_invites', { projectId: updatedJob.projectId }, { jobId: updatedJob.jobId }, `Updated GC Info for ${updatedJob.jobId}`)
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('addEstimate', async ({ estimate, jobs }, callback) => {
        try {
            const estimateId = await insertIntoTable('estimates', estimate)
            const estimateType = state.estimateTypes.find(type => estimate.estimateTypeId == type.id)
            const estimateMapResp = await Promise.all(jobs.map(job => insertIntoTable('map_estimates_to_jobs', { estimateId, jobId: job.jobId })))
            const updatedTransactionResp = await Promise.all(jobs.map((job) => writeJobTransaction({ ...job, historyOnlyNotes: `${estimateType.type} Estimate added` })))
            jobs.forEach(job => {
                emitUpdatedJob(job.jobId)
            })
            callback(jobs)
        }
        catch (e) {
            callback({ error: e })
        }
    })

    socket.on('deleteInvite', async (job: Job) => {
        try {
            await updateTable('bid_invites', { isActive: 0 }, { jobId: job.jobId }, 'Delete Invite')
            emitJobRemoved(job.jobId)
        }
        catch (e) {
        }
    })

    socket.on('deleteFile', async ({ file, job }: { file: AttachedFile, job: Job }) => {
        try {
            await updateTable('job_files', { isActive: 0 }, { fileId: file.fileId }, 'Delete File')
            emitUpdatedJob(job.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('getMatchingProjects', async (projectId, callback) => {
        callback(await fetchFromTable('bid_invites_active', `Matching Proejcts`, { projectId }))
    })

    socket.on('removeProposal', async ({ proposalId, job }: { proposalId: number, job: Job }) => {
        try {
            await updateTable('map_proposals_sent', { isActive: 0 }, { id: proposalId }, 'Delete File')
            const rawProp = await fetchFromTable('proposal_snapshot', `Proposal History for ${job.jobDisplayId}`, { jobId: [job.jobId] })
            const proposals = packageProposal(rawProp)

            if (job.currentDashboardColumn != 'estimating')
                return socket.emit('getProposalHistory', { job, proposals })
            const currentEstimates = await fetchFromTable('proposal_current', `Current Proposal for ${job.jobDisplayId}`, { jobId: [job.jobId] })
            const currentProp = {
                id: null,
                estimates: currentEstimates,
                dateSent: 'current',
                projectValue: currentEstimates.map(prop => +prop.cost).reduce((a, b) => a += b, 0),
                outsourceCost: currentEstimates.map(prop => +prop.fee).reduce((a, b) => a += b, 0),
                finalCost: null,
                finalCostNote: null
            }
            socket.emit('getProposalHistory', { job, proposals: proposals.concat(currentProp) })
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('fillBox', async ({ boxId, projectId }) => {
        try {
            const matchingBox = state.boxOptions.find(option => option.id == boxId)
            const resp = await updateTable('options_boxes', { isFull: projectId, jobCount: matchingBox.jobCount + 1 }, { id: boxId }, `Box ${boxId} filled`)
            const openBoxes = await fetchFromTable('options_boxes', "Boxes")
            state.boxOptions = openBoxes
            socket.emit('getBoxOptions', openBoxes)
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('emptyBox', async (boxId) => {
        try {
            const matchingBox = state.boxOptions.find(option => option.id == boxId)
            const newJobCount = matchingBox.jobCount - 1
            const resp = await updateTable('options_boxes', { isFull: newJobCount <= 0 ? 0 : matchingBox.isFull, jobCount: newJobCount <= 0 ? 0 : newJobCount }, { id: boxId }, `Box ${boxId} emptied`)
            const openBoxes = await fetchFromTable('options_boxes', "Boxes")
            state.boxOptions = openBoxes
            socket.emit('getBoxOptions', openBoxes)
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('changeBox', async ({ projectId, newBox }) => {
        //Empty Old Box
        // console.log({ projectId })
        // const matchingBox = await fetchFromTable('options_boxes', "Boxes", { isFull: projectId })
        // console.log(matchingBox)
        // const oldBox = matchingBox[0]
        // console.log({ oldBox })
        // let emptyResp
        // if (oldBox)
        //     emptyResp = await updateTable('options_boxes', { isFull: 0, jobCount: 0 }, { id: oldBox.id }, `Box ${oldBox.id} emptied`)

        //Fill New Box
        // const fillResp = await updateTable('options_boxes', { isFull: 0, jobCount: 0 }, { id: newId }, `Box ${newId} filled`)
        const allJobs = await fetchFromTable('bid_dashboard', "Jobs", { projectId })
        const transactionCall = allJobs.map(job => {
            return writeJobTransaction({
                ...job,
                box: newBox.id,
                historyOnlyNotes: `Moved to box ${newBox.boxId}`
            })
        })
        await Promise.all(transactionCall)
        allJobs.map(job => emitUpdatedJob(job.jobId))
        // await Promise.all(jobUpdateCall)
        // //Return boxes
        // const openBoxes = await fetchFromTable('options_boxes', "Boxes")
        // socket.emit('getBoxOptions', openBoxes)
    })

    socket.on('moveBid', async (updatedJob, callback) => {
        try {
            await updateTable('bid_invites', { currentDashboardColumn: updatedJob.currentDashboardColumn, lastMoveDate: new Date().toLocaleString() }, { jobId: updatedJob.jobId }, 'Update Invite')
            await writeJobTransaction({
                ...updatedJob,
                statusId: state.dashboardColumns.find(col => col.id == updatedJob.currentDashboardColumn).defaultStatusId,
            })
            console.log(updatedJob.jobId, updatedJob.currentDashboardColumn)
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
        }
    })

    socket.on('toggleNoBid', async (updatedJob: Job, callback) => {
        try {
            await updateTable(
                'bid_invites', {
                isNoBid: +updatedJob.isNoBid,
                noBidDate: updatedJob.isNoBid
                    ? new Date().toLocaleString()
                    : ""
            },
                { jobId: updatedJob.jobId },
                'Toggle No Bid'
            )
            await writeJobTransaction({ ...updatedJob, historyOnlyNotes: updatedJob.isNoBid ? "Not Bidding" : "Returned To Bid Invitation" })
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('updateJob', async (updatedJob: Job, callback) => {
        try {
            await writeJobTransaction(updatedJob)
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('updateBid', async (updatedJob: Job, callback) => {
        try {
            await updateTable(
                'bid_invites', { isAlerted: +updatedJob.isAlerted },
                { jobId: updatedJob.jobId },
                `Highlight ${updatedJob.jobDisplayId}`
            )
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    // SPELLING ERROR IN v1.0.9, even needs to stay until people update
    socket.on('upateBid', async (updatedJob: Job, callback) => {
        try {
            await updateTable(
                'bid_invites', { isAlerted: +updatedJob.isAlerted },
                { jobId: updatedJob.jobId },
                `Highlight ${updatedJob.jobDisplayId}`
            )
            emitUpdatedJob(updatedJob.jobId)
        }
        catch (e) {
            console.log(e)
        }
    })

    // ----------------------------------------------------------

    // ------------------------Charts---------------------------

    // socket.on('charts', () => {
    //     socket.emit('getChartConfigs', state.chartConfigs)
    //     socket.emit('getTimeShortcuts', state.timeShortcuts)
    // })

    // socket.on('fetchChartData', async (config: ChartConfig, start: number, end: number) => {
    //     try {
    //         console.log(new Date(start * 1000).toDateString())
    //         const data = await runStoredProcedure(config.storedProcedure, start, end, config.name)
    //         socket.emit('updateChart', { config, data: data[0] })
    //     }
    //     catch (e) {
    //         console.log(e)
    //     }
    // })

    // ------------------------Reports---------------------------


    socket.on('init', callback => {
        callback({
            chartConfigs: state.chartConfigs,
            reportConfigs: state.reportConfigs,
            rawShortcuts: state.timeShortcuts
        })
    })

    // socket.on('fetchReportData', async (config: ChartConfig, start: number, end: number) => {
    //     try {
    //         console.log(new Date(start * 1000).toDateString())
    //         const data = await runStoredProcedure(config.storedProcedure, start, end, config.name)
    //         socket.emit('updateReport', { config, data: data[0] })
    //     }
    //     catch (e) {
    //         console.log(e)
    //     }
    // })

    socket.on('refreshBackend', async (triggerEvent: string, callback) => {
        state.users = state.users.filter(user => user.id != socket.id)
        console.log('User Left: (' + state.users.length + ")")
        clearInterval(refreshInterval)
        await initializeBackend()
        callback(triggerEvent)
    })

    socket.on('disconnect', () => {
        state.users = state.users.filter(user => user.id != socket.id)
        console.log('User Left: (' + state.users.length + ")")
    })

    // -------------------------Search------------------------

    socket.on('seach', async (term, callback) => {
        callback(await runSearch(term))
    })

    socket.on('getJob', async (jobId, callback) => {
        const resp = await fetchFromTable('bid_invites_active', "Bid Invites", { jobId })
        if (!resp.length) return callback(null)
        callback(resp[0])
    })



    // --- GENERIC DB ACTIONS
    socket.on('removeEstimate', async (table, where, callback) => {
        callback(await deleteFromTable(table, where, 'Delete'))
    })
})

router.get('/api/data/:procedure', (req, resp) => {
    const procedure = req.params.procedure
    if (procedure == 'undefined') return resp.status(500).send({ error: "Missing Chart Stored Procedure to query from" })
    const params = Object.keys(req.query)
        .map(key => ({ [key]: req.query[key] !== 'null' ? +req.query[key] : null }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
    const timeRange = createTimeRange(params)
    if (!timeRange) return resp.status(500).send({ error: "Missing Time Frame" })

    runQuery(`CALL ${procedure}${timeRange}`, procedure, ({ error, results }) => {
        if (error) return resp.status(500).send({ error })
        resp.send(results[0])
    })
})

async function emitUpdatedJob(jobId) {
    const newJob = await fetchFromTable('bid_invites_active', "Bid Invites", { jobId: jobId })
    console.log(newJob[0].jobId)
    state.invites = {
        ...state.invites,
        ...{ [jobId]: newJob[0] }
    }
    io.to(room).emit('getUpdatedJob', newJob.pop())
}

async function emitJobRemoved(jobId) {
    state.invites = Object.keys(state.invites)
        .filter(key => key != jobId)
        .map(key => ({ [key]: state.invites[key] }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
    io.to(room).emit('getRemovedJob', jobId)
}

function createTimeRange(time: {}): string {
    if (Object.keys(time).length === 0) return ""
    const start = time['start'] - +(time['start'] == time['end']) * 86400
    const end = time['end']
    return `(${start},${end})`
}


async function writeJobTransaction(updatedJob: Job) {
    try {
        let newTransaction = {
            jobId: updatedJob.jobId,
            date: new Date().toLocaleString(),
            notes: updatedJob.notes ? updatedJob.notes : '',
            assignedTo: updatedJob.assignedTo ? updatedJob.assignedTo : 0,
            statusId: updatedJob.statusId,
        } as any

        // Why would you do this and not just pass in the entire updatedJob item?
        if (updatedJob.box)
            newTransaction.box = updatedJob.box
        if (updatedJob.historyOnlyNotes)
            newTransaction.historyOnlyNotes = updatedJob.historyOnlyNotes
        if (updatedJob.reportOnlyNotes)
            newTransaction.reportOnlyNotes = updatedJob.reportOnlyNotes
        if (updatedJob.proposalId)
            newTransaction.proposalId = updatedJob.proposalId
        if (updatedJob.followupDate)
            newTransaction.followupDate = updatedJob.followupDate
        await Promise.all([
            insertIntoTable('job_transactions', newTransaction),
            updateTable('job_transactions',
                { dateEnded: new Date().toLocaleString() },
                { id: updatedJob.transactionId },
                "Previous Transaction")
        ])
    }
    catch (e) {
        console.log(e)
    }
}

function packageProposal(dbResponse): Proposal[] {
    return dbResponse.map(resp => {
        const concreteEstimate = {
            type: "concrete",
            cost: resp['concreteCost'],
            fee: resp['concreteFee'],
            estimatorName: resp['concreteEstimator'],
            estimateDateCreated: resp['concreteDateCreated'],
        }

        const excavationEstimate = {
            type: "excavation",
            cost: resp['excavationCost'],
            fee: resp['excavationFee'],
            estimatorName: resp['excavationEstimator'],
            estimateDateCreated: resp['excavationDateCreated'],
        }

        const brickEstimate = {
            type: "brick",
            cost: resp['brickCost'],
            fee: resp['brickFee'],
            estimatorName: resp['brickEstimator'],
            estimateDateCreated: resp['brickDateCreated'],
        }

        const cmuEstimate = {
            type: "cmu",
            cost: resp['cmuCost'],
            fee: resp['cmuFee'],
            estimatorName: resp['cmuEstimator'],
            estimateDateCreated: resp['cmuDateCreated'],
        }
        const otherEstimate = {
            type: "other",
            cost: resp['otherCost'],
            fee: resp['otherFee'],
            estimatorName: resp['otherEstimator'],
            estimateDateCreated: resp['otherDateCreated'],
        }
        return {
            id: resp['id'],
            estimates: [concreteEstimate, excavationEstimate, brickEstimate, cmuEstimate, otherEstimate],
            dateSent: resp['dateSent'],
            projectValue: resp['projectValue'],
            outsourceCost: resp['outsourceCost'],
            finalCost: resp['finalCost'],
            finalCostNote: resp['finalCostNote']
        }

    })
}

server.listen(port, () => {
    console.log(`Server has started on port ${port}`)
})



