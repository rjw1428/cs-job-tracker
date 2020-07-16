export interface Estimate {
    estimateId: number
    estimatorId: number
    mapId: number
    isInHouse: boolean
    fee?: number
    excavationCost?: number
    concreteCost?: number
    brickCost?: number
    otherCost?: number
    cmuCost?: number
    estimateDateCreated: string
    estimator?: string
    project_value?: number
}