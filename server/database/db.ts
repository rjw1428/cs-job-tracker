import * as mysql from 'mysql'
import * as express from 'express'
import * as path from 'path';
import * as dotenv from "dotenv";


dotenv.config({ path: path.join(__dirname, "../.env") })

const poolOptions = {
    connectionLimit: 3,
    port: 3306,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    waitForConnections: true
};

function runQuery(query: string, callback) {
    const pool = mysql.createPool(poolOptions)
    pool.getConnection((err, conn) => {
        if (err) {
            if (err.code == 'ER_USER_LIMIT_REACHED')
                return callback({ error: err })
        }
        try {
            console.log(`MySQL connection made on port ${poolOptions.port}`)
            conn.query(query, (err, results, fields) => {
                conn.release()
                if (err) callback({ error: err })
                pool.end(err => {
                    if (err) callback({ error: err })
                })
                callback({ results })
            })
        } catch (err) {
            callback({ error: err })
        }
    })
}

export const router = express.Router()

//GET TABLE OF VALUES
router.get('/api/:table', (req, resp) => {
    const _table = req.params.table
    const _params = Object.keys(req.query).map(key => {
        const paramValue = req.query[key] as string
        return { [key]: paramValue.split("|") }
    }).reduce((acc, cur) => ({ ...acc, ...cur }), {})
    const _whereClause = createWhereClauses(_params)
    //NEED TO TOGGLE SORT TO GET COLS TO SHOW DATA IN ORDER
    //const _orderByClause = "ORDER BY dateDue DESC"  ${_orderByClause}
    runQuery(`SELECT * FROM ${_table} ${_whereClause}`, ({ error, results }) => {
        if (error) resp.status(500).send({ error })
        resp.send(results)
    })
})

//GET VALUE FROM TABLE BY ID
router.get('/api/:table/:id', (req, resp) => {
    const _table = req.params.table
    const _id = req.params.id
    runQuery(`SELECT * FROM ${_table} WHERE id=${_id}`, ({ error, results }) => {
        if (error) resp.status(500).send({ error })
        resp.send(results)
    })
})

//INSERT INTO TABLE
router.post('/api/:table', (req, resp) => {
    const _fields = Object.keys(req.body).join(',')
    const _values = Object.values(req.body).map(val => "\"" + val + "\"").join(",")
    const _table = req.params.table
    runQuery(`INSERT INTO ${_table} (${_fields}) VALUES (${_values})`, ({ error, results }) => {
        if (error) resp.status(500).send({ error })
        resp.send(results)
    })
})

//UPDATE TABLE
router.post('/api/update/:table', (req, resp) => {
    const _setObj = req.body.set
    const _whereObj = req.body.where
    const _table = req.params.table
    console.log(_setObj)
    const _setClause = createSetClause(_setObj)
    console.log(_setClause)
    const _whereClause = Object.keys(_whereObj).map(key => `${key} = ${_whereObj[key]}`)[0]
    console.log(_whereClause)
    runQuery(`UPDATE ${_table} SET ${_setClause} WHERE ${_whereClause}`, ({ error, results }) => {
        if (error) resp.status(500).send({ error })
        resp.send(results)
    })
})


//DELETE FROM TABLE
router.post('/api/delete/:table', (req, resp) => {
    const _whereObj = req.body
    const _table = req.params.table
    const _whereClause = Object.keys(_whereObj).map(key => `${key} = ${_whereObj[key]}`)[0]
    runQuery(`DELETE FROM ${_table} WHERE ${_whereClause}`, ({ error, results }) => {
        if (error) resp.status(500).send({ error })
        resp.send(results)
    })
})

function createWhereClauses(obj: {}): string {
    if (Object.keys(obj).length === 0) return ""
    return "WHERE " + Object.keys(obj).map(key => {
        return obj[key].length > 1
            ? `${key} IN (${obj[key].join(",")})`
            : `${key} = ${obj[key]}`
    }).join(" AND ")
}

function createSetClause(setObj: {}) {
    return Object.keys(setObj).map(key => {
        return `${key} = '${setObj[key]}'`
    }).join(", ")
}

export function saveFile(jobId, fileName, date, callback) {
    const _table = "job_files"
    const _fields = ["jobId", "fileName", "fileLocation", "dateCreated"].join(',')
    const _values = [`'${jobId}'`, `'${fileName}'`,`'${jobId}/${fileName}'`, `'${date}'`].join(',')
    runQuery(`REPLACE INTO ${_table} (${_fields}) VALUES (${_values})`, ({ error, results }) => {
        if (error) callback({ error })
        callback(results)
    })
}