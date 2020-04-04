
export interface EpidemicResponseModel {
    confirmedCases: number
    confirmedCasesReportDate: Date
    confirmedCasesGrowthRatePerMinute: number
    confirmedDeaths: number
    confirmedDeathsReportDate: Date
    country: {
        countryCode: string
        population: number
        populationReportDate: Date
        populationGrowthPerMinute: number
    },
    disease: {
        name: string
        rNaughtValue: number
        diseaseLengthEstimateInMins: number
    },
    recoveredCases: number
    recoveredCasesReportDate: Date
    recoveredCasesShouldEstimate: boolean
}