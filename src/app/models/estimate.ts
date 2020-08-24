export interface Estimate {
    estimateId: number
    estimatorId: number
    mapId: number
    isInHouse: boolean
    fee?: number
    type: string
    cost: number
    dateCreated: string
    estimator: string
}