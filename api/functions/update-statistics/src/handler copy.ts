import { Epidemic, Figures } from "./disease";
import fetch from "node-fetch"; 
import merge from "lodash.merge";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3();

const keyName= "api/countries/gb/diseases/sars-cov-2.json";

type GovUk_ArcGIS_PreviousFiguresResponseType = {
    objectIdFieldName: string
    uniqueIdField: object
    globalIdFieldName: string,
    fields: [],
    features: {
        attributes: 
            { 
                DateVal: number,
                CMODateCount: number | null,
                CumCases: number | null,
                DailyDeaths: number| null,
                CumDeaths: number | null,
                FID: number
            }
    }[]
}

type previousFigures = {confirmed: number, reportDate: string}

const refactorDateToActual = (inp: Date) : Date => {
    inp.setHours(8);
    inp.setMinutes(0);
    inp.setSeconds(0);
    return inp;
};

export class StatisticsHandler  {
    private bucketName: string;

    constructor(bucketName: string) {        
        this.bucketName = bucketName;
    }
    
    private async doesObjectExistInS3(bucket:string, key: string) : Promise<boolean> {
        try {
            const headResult = await s3.headObject({Bucket: this.bucketName, Key: keyName}).promise();
            
            if (headResult)
                return true;

        } catch (error) {
            if (error.code && error.code == "NotFound")
                return false;

            throw error;
        }
        
        return false;
    }

    public async updateGbStatistics() : Promise<void> {
        let existingContent:object = {};

        try {
            if (await this.doesObjectExistInS3(this.bucketName, keyName)) {

                const currentContent = await s3.getObject({Bucket: this.bucketName, Key: keyName}).promise();
                console.trace(currentContent);
        
                if (currentContent.Body != undefined && currentContent.ContentLength && currentContent.ContentLength > 0)
                { 
                    const content = currentContent.Body.toString('utf-8');
                    existingContent = JSON.parse(content) as Epidemic;
                }
            }

            const figures = await this.getGbStatistics();

            if (figures != null) {

                const update = merge(existingContent, figures);
                
                await s3.putObject(
                    {
                        Bucket: this.bucketName,
                        Key: keyName,
                        ACL: 'public-read',
                        Body: JSON.stringify(update)
                    }).promise();
            }
        } catch (error) {
            debugger;
            console.error(error);
        }
    }
 
    private async getGbStatistics() : Promise<Epidemic | null> { 
        debugger;
        //Daily indicators.
        let response = await fetch("https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyIndicators/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=102100&resultOffset=0&resultRecordCount=50&cacheHint=true");
        console.trace(JSON.stringify(response));
        if (response && response.ok) {
            const json = await response.json() as {
                features: {
                    attributes: {
                        DateVal: number,
                        TotalUKCases: number,
                        NewUKCases: number,
                        TotalUKDeaths: number,
                        DailyUKDeaths: number
                    }
                }[]
            };

            const dailyIndicators = json.features[0].attributes;
            const minutesPerWeek =  1 * 60 * 24 * 7;
            //Previous figures.
            response = await fetch("https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyConfirmedCases/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=DateVal%20asc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true");
            console.trace(JSON.stringify(response));

            if (response && response.ok) {
                const json = await response.json() as GovUk_ArcGIS_PreviousFiguresResponseType;

                const previousConfirmedCases = json.features
                    .filter(f => f.attributes.DateVal && f.attributes.CumCases)
                    .map<{cumulative: number, change: number, reportDate: string}>(f => {
                        return {
                            cumulative: f.attributes.CumCases! ?? 0,
                            change: f.attributes.CMODateCount! ?? 0,
                            reportDate: refactorDateToActual(new Date(f.attributes.DateVal)).toJSON()
                        }
                    });
                    
                const previousConfirmedDeaths = json.features
                    .filter(f => f.attributes.DateVal && f.attributes.CumCases)
                    .map<{cumulative: number, change: number, reportDate: string}>(f => {
                        return {
                            cumulative: f.attributes.CumDeaths! ?? 0,
                            change: f.attributes.DailyDeaths! ?? 0,
                            reportDate: refactorDateToActual(new Date(f.attributes.DateVal)).toJSON()
                        }
                    });

                return {
                    cases: {
                        change: dailyIndicators.NewUKCases,
                        cumulative: dailyIndicators.TotalUKCases,
                        confirmedCasesGrowthRatePerMinute: 0,
                        reportDate: refactorDateToActual(new Date(dailyIndicators.DateVal)).toJSON(),
                        previousFigures: previousConfirmedCases
                    },
                    deaths: {
                        cumulative: dailyIndicators.TotalUKDeaths,
                        change: dailyIndicators.NewUKCases,
                        confirmedCasesGrowthRatePerMinute: 0,
                        previousFigures: previousConfirmedDeaths,
                        reportDate: refactorDateToActual(new Date(dailyIndicators.DateVal)).toJSON()
                    },
                    disease: {
                        diseaseLengthEstimateInMins: minutesPerWeek,
                        name: "sars-cov-2",
                        rNaughtValue: 2.6
                    },
                    recoveries: {
                        cumulative: 130,
                        change: 130,
                        confirmedCasesGrowthRatePerMinute: 0,
                        previousFigures: [],
                        reportDate: new Date(Date.parse("2020-02-20T20:00:00+0100")).toJSON()
                    },
                    recoveriesShouldEstimate: true,
                    socialDistancingStartedInHostCountry: new Date(Date.parse("2020-03-20T20:00:00+0100")).toJSON()
                }
            }
        }

        return null;
    }
}

