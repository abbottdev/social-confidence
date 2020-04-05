
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
    country: {
        countryCode: string
        population: number
        populationReportDate: Date
        populationGrowthPerMinute: number
        socialDistancingStarted: string
    },
    disease: {
        name: string
        rNaughtValue: number
        diseaseLengthEstimateInMins: number
    },
}