export interface Figures {
    confirmed?: number
    reportDate?: string
    confirmedCasesGrowthRatePerMinute?: number | null
    previousFigures?: {
        confirmed: number
        reportDate: string
    }[]
}

export interface Epidemic {
    cases?: Figures
    deaths?: Figures
    recoveries?: Figures
    recoveriesShouldEstimate?: boolean
    socialDistancingStartedInHostCountry?: string
    disease?: {
        name?: string
        rNaughtValue?: number
        diseaseLengthEstimateInMins?: number
    }
}