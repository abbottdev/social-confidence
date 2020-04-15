
export interface ReportFigureModel {
    cumulative: number
    change: number
    reportDate: string
    confirmedCasesGrowthRatePerMinute: number | null
    previousFigures: {
        cumulative: number
        change: number
        reportDate: string
    }[]
}

export interface EpidemicResponseModel {
    cases: ReportFigureModel
    deaths: ReportFigureModel
    recoveries: ReportFigureModel
    recoveriesShouldEstimate: boolean
    disease: {
        name: string
        rNaughtValue: number
        diseaseLengthEstimateInMins: number
    },
    socialDistancingStartedInHostCountry: string
}