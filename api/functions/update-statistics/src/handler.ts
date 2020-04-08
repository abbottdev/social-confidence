import S3Client from "aws-sdk/clients/s3";
import moment, { duration } from "moment";
import { Epidemic, Figures } from "./diasease";
import { SharedIniFileCredentials } from "aws-sdk";
import fetch from "node-fetch"; 
import merge from "lodash.merge";

const s3 = new S3Client({
    credentials: new SharedIniFileCredentials({profile: "personal"})
});

const bucketName = 'social-confidence';
const keyName= "api/countries/gb/diseases/sars-cov-2-automated.json";

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

export const getGbStatistics = async() : Promise<Epidemic | null> => { 
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

        //Previous figures.
        response = await fetch("https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyConfirmedCases/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=DateVal%20asc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true");
        console.trace(JSON.stringify(response));

        if (response && response.ok) {
            const json = await response.json() as GovUk_ArcGIS_PreviousFiguresResponseType;

            const previousConfirmedCases = json.features
                .filter(f => f.attributes.DateVal && f.attributes.CumCases)
                .map<{confirmed: number, reportDate: string}>(f => {
                    return {
                        confirmed: f.attributes.CumCases! ?? 0,
                        reportDate: moment(f.attributes.DateVal).toJSON()
                    }
                });
                
            const previousConfirmedDeaths = json.features
                .filter(f => f.attributes.DateVal && f.attributes.CumCases)
                .map<{confirmed: number, reportDate: string}>(f => {
                    return {
                        confirmed: f.attributes.CumDeaths! ?? 0,
                        reportDate: moment(f.attributes.DateVal).toJSON()
                    }
                });

            return {
                cases: {
                    confirmed: dailyIndicators.TotalUKCases,
                    confirmedCasesGrowthRatePerMinute: 0,
                    reportDate: moment(dailyIndicators.DateVal).toJSON(),
                    previousFigures: previousConfirmedCases
                },
                deaths: {
                    confirmed: dailyIndicators.TotalUKDeaths,
                    confirmedCasesGrowthRatePerMinute: 0,
                    previousFigures: previousConfirmedDeaths,
                    reportDate: moment(dailyIndicators.DateVal).toJSON()
                },
                // disease: {
                //     diseaseLengthEstimateInMins: duration(1, "week").asMinutes(),
                //     name: "sars-cov-2",
                //     rNaughtValue: 2.6
                // },
                // recoveries: {
                //     confirmed: 130,
                //     confirmedCasesGrowthRatePerMinute: 0,
                //     previousFigures: [],
                //     reportDate: moment("2020-02-20T20:00:00+0100").toJSON()
                // },
                recoveriesShouldEstimate: true,
                //socialDistancingStartedInHostCountry: moment("2020-03-20T20:00:00+0100").toJSON()
            }
        }
    }

    return null;
}

const doesObjectExistInS3 = async (bucket:string, key: string) : Promise<boolean> => {
    try {
        const headResult = await s3.headObject({Bucket: bucketName, Key: keyName}).promise();
        
        if (headResult)
            return true;

    } catch (error) {
        if (error.code && error.code == "NotFound")
            return false;

        throw error;
    }
    
    return false;
};


export const updateGbStatistics = async() : Promise<void> => {
    let existingContent:object = {};

    debugger;
    try {
        if (await doesObjectExistInS3(bucketName, keyName)) {

            const currentContent = await s3.getObject({Bucket: bucketName, Key: keyName}).promise();
            console.trace(currentContent);
    
            if (currentContent.Body != undefined && currentContent.ContentLength && currentContent.ContentLength > 0)
            { 
                const content = currentContent.Body.toString('utf-8');
                existingContent = JSON.parse(content) as Epidemic;
            }
        }

        const figures = await getGbStatistics();

        if (figures != null) {

            const update = merge(existingContent, figures);
            
            await s3.putObject(
                {
                    Bucket: bucketName,
                    Key: keyName,
                    Body: JSON.stringify(update)
                }).promise();
        }
    } catch (error) {
        debugger;
        console.error(error);
    }
}