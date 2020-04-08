
export interface ReportFigureModel {
    confirmed: number
    reportDate: string
    confirmedCasesGrowthRatePerMinute: number | null
    previousFigures: {
        confirmed: number
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