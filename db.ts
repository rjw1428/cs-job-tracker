import * as mysql from 'mysql'
import * as express from 'express'
import * as path from 'path';
import * as dotenv from "dotenv";
import { Estimator } from './cs-front-end/src/models/estimator'
import { EstimateType } from './cs-front-end/src/models/estimateType';
import { Contractor } from './cs-front-end/src/models/contractor';

dotenv.config({ path: path.join(__dirname, "./.env") })

const poolOptions = {
    connectionLimit: 3,
    port: 3306,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    waitForConnections: true
};

function runQuery(query: string, messagePrefix: string, callback) {
    const pool = mysql.createPool(poolOptions)
    pool.getConnection((err, conn) => {
        if (err) {
            if (err.code == 'ER_USER_LIMIT_REACHED')
                return callback({ error: err })
        }
        try {
            conn.query(query, (err, results) => {
                console.log(`${messagePrefix} MySQL connection made on port ${poolOptions.port}`)
                conn.release()
                if (err) return callback({ error: err })
                pool.end(err => {
                    if (err) return callback({ error: err })
                })
                return callback({ results })
            })
        } catch (err) {
            callback({ error: err })
        }
    })
}

//INSERT INTO TABLE
export const insertIntoTable = (table: string, payload: any) => {
    const fields = Object.keys(payload).join(',')
    const values = Object.values(payload).map(val => "\"" + val + "\"").join(",")
    return new Promise<Estimator[]>((resolve, reject) => {
        runQuery(`INSERT INTO ${table} (${fields}) VALUES (${values})`, "Insert -", ({ error, results }) => {
            if (error) return reject(error)
            resolve(results.insertId)
        })
    })
}

// FETCH FROM TABLE
export const fetchFromTable = (tableName: string, dataInfo: string, where = {}) => {
    const whereClause = createWhereClauses(where)
    return new Promise<any[]>((resolve, reject) => {
        runQuery(`SELECT * FROM ${tableName} ${whereClause}`, `Fetch ${dataInfo} -`, ({ error, results }) => {
            if (error) return reject(error)
            resolve(results)
        })
    })
}

// UPDATE DATA
export const updateTable = (table: string, set: {}, where: {}, dataInfo: string) => {
    const setClause = createSetClause(set)
    const whereClause = createWhereClauses(where)
    return new Promise<any[]>((resolve, reject) => {
        runQuery(`UPDATE ${table} SET ${setClause} ${whereClause}`, `Update ${dataInfo} -`, ({ error, results }) => {
            if (error) return reject(error)
            resolve(results)
        })
    })
}

export const fetchInitialSQLData = () => {
    // Get Estimators
    let fetchEstimators = fetchFromTable('estimators', "Estimators")
    let fetchEstimateTypes = fetchFromTable('options_estimate_types', "Estimate Types")
    let fetchBoxOptions = fetchFromTable('options_boxes', "Boxes")
    let fetchBidInvites = fetchFromTable('bid_invites_active', "Bid Invites")
    return Promise.all([fetchEstimators, fetchEstimateTypes, fetchBoxOptions, fetchBidInvites])
}

export const injectScript = async (script: string) => {
    return new Promise<any[]>((resolve, reject) => {
        runQuery(script, `Sql Injection -`, ({ error, results }) => {
            if (error) return resolve(error)
            resolve(results)
        })
    })
}

function createWhereClauses(obj: {}): string {
    if (Object.keys(obj).length === 0) return ""
    return 'WHERE ' + Object.keys(obj).map(key => {
        return obj[key].length > 1
            ? `${key} IN (${obj[key].join(",")})`
            : `${key} = '${obj[key]}'`
    }).join(" AND ")
}

function createSetClause(setObj: {}) {
    return Object.keys(setObj).map(key => {
        return `${key} = '${setObj[key]}'`
    }).join(", ")
}


// export const router = express.Router()


// router.get('/api/search', (req, resp) => {
//     const _value = req.query.value
//     runQuery(`CALL search('${_value}')`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results[0])
//     })
// })


// //GET TABLE OF VALUES
// router.get('/api/:table', (req, resp) => {
//     const _table = req.params.table
//     if (_table == 'undefined')  return resp.status(500).send({ error: "Missing Table Name to query from" })
//     const _params = Object.keys(req.query).map(key => {
//         const paramValue = req.query[key] as string
//         return { [key]: paramValue.split("|") }
//     }).reduce((acc, cur) => ({ ...acc, ...cur }), {})
//     const _whereClause = createWhereClauses(_params)
//     //NEED TO TOGGLE SORT TO GET COLS TO SHOW DATA IN ORDER
//     //const _orderByClause = "ORDER BY dateDue DESC"  ${_orderByClause}
//     runQuery(`SELECT * FROM ${_table} ${_whereClause}`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results)
//     })
// })

// router.get('/api/chart/:procedure', (req, resp) => {
//     const _procedure = req.params.procedure
//     if (_procedure == 'undefined')   return resp.status(500).send({ error: "Missing Chart Stored Procedure to query from" })
//     const _params = Object.keys(req.query)
//         .map(key => {
//             return { [key]: +req.query[key] }
//         })
//         .reduce((acc, cur) => ({ ...acc, ...cur }), {})
//     const _timeRange = createTimeRange(_params)

//     runQuery(`CALL ${_procedure}${_timeRange}`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results[0])
//     })
// })

// router.get('/api/report/:procedure', (req, resp) => {
//     const _procedure = req.params.procedure
//     if (_procedure == 'undefined')   return resp.status(500).send({ error: "Missing Report Stored Procedure to query from" })
//     const _params = Object.keys(req.query)
//         .map(key => {
//             return { [key]: +req.query[key] }
//         })
//         .reduce((acc, cur) => ({ ...acc, ...cur }), {})
//     const _timeRange = createTimeRange(_params)

//     runQuery(`CALL ${_procedure}${_timeRange}`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results[0])
//     })
// })


// //GET VALUE FROM TABLE BY ID
// router.get('/api/:table/:id', (req, resp) => {
//     const _table = req.params.table
//     const _id = req.params.id
//     runQuery(`SELECT * FROM ${_table} WHERE id=${_id}`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results)
//     })
// })



// //UPDATE TABLE
// router.post('/api/update/:table', (req, resp) => {
//     const _setObj = req.body.set
//     const _whereObj = req.body.where
//     const _table = req.params.table
//     console.log(_setObj)
//     const _setClause = createSetClause(_setObj)
//     console.log(_setClause)
//     const _whereClause = Object.keys(_whereObj).map(key => `${key} = ${_whereObj[key]}`)[0]
//     console.log(_whereClause)
//     runQuery(`UPDATE ${_table} SET ${_setClause} WHERE ${_whereClause}`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results)
//     })
// })


// //DELETE FROM TABLE
// router.post('/api/delete/:table', (req, resp) => {
//     const _whereObj = req.body
//     const _table = req.params.table
//     const _whereClause = Object.keys(_whereObj).map(key => `${key} = ${_whereObj[key]}`)[0]
//     runQuery(`DELETE FROM ${_table} WHERE ${_whereClause}`, ({ error, results }) => {
//         if (error) resp.status(500).send({ error })
//         resp.send(results)
//     })
// })

// function createTimeRange(time: {}): string {
//     if (Object.keys(time).length === 0) return ""
//     const start = time['start'] - +(time['start'] == time['end']) * 86400
//     const end = time['end']
//     return `(${start},${end})`
// }




export function saveFile(jobId, folderName, fileName, date) {
    const _table = "job_files"
    const _fields = ["jobId", "displayId", "fileName", "fileLocation", "dateCreated"].join(',')
    const _values = [`'${jobId}'`, `'${folderName}'`, `'${fileName}'`, `'${folderName}/${fileName}'`, `'${date}'`].join(',')
    return new Promise<any[]>((resolve, reject) => {
        runQuery(`REPLACE INTO ${_table} (${_fields}) VALUES (${_values})`, `Saving File - ${folderName}/${fileName}`, ({ error, results }) => {
            if (error) return reject({ error })
            resolve(results)
        })
    })
}

export function pingDB(callback) {
    runQuery("SELECT 1", "Heartbeat -", (resp) => {
        callback(resp)
    })
}