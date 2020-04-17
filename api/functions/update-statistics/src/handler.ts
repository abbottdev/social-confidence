import { Epidemic, Figures } from "./disease";
import fetch from "node-fetch"; 
import merge from "lodash.merge";
import * as AWS from "aws-sdk";
import * as xmlJs from "xml2js";
import moment, { Moment, Duration } from "moment";
 
const s3 = new AWS.S3();

const keyName= "api/countries/gb/diseases/sars-cov-2.json";

const removeToday = false;

type previousFigures = {confirmed: number, reportDate: string}

//const exclusionDates: string[] = ['2020-04-13'];

type valueAsNumber = { value: number };
type valueAsString = { value: string };
type valueAsDate = { date: string };

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
                        Body: JSON.stringify(update),
                        ContentType: "application/json",
                        Metadata: {
                            "Cache-Control": "max-age=3600"
                        }
                    }).promise();
            }
        } catch (error) {
            debugger;
            console.error(error);
        }
    }

    private async getLatestStatisticsUrl() : Promise<string | undefined> {
        let response = await fetch("https://publicdashacc.blob.core.windows.net/publicdata?restype=container&comp=list");
        console.trace(JSON.stringify(response));
        if (response && response.ok) {
            let contentConvertedToJson = await xmlJs.parseStringPromise(await response.text());

            const json = contentConvertedToJson as {
                EnumerationResults : {
                    Blobs: {
                        Blob: {
                            Name: string[],
                            Properties: {
                                "Last-Modified": string[],
                                [key:string]: string[]
                            }[]
                        }[]
                    }[]
                }
            };

            const allBlobs = json.EnumerationResults.Blobs.map(b => b.Blob).reduce((acc, val) => acc.concat(val), []);
            const sortedBlobs = allBlobs.sort((a, b) => moment(a.Properties[0]["Last-Modified"][0]).valueOf() - moment(b.Properties[0]["Last-Modified"][0]).valueOf());
            const filteredBlobs = allBlobs.filter(alb => alb.Name[0].startsWith("data_"));

            //Get the latest element
            //const latestMapped = json.EnumerationResults.Blobs.map(b => {return { name: b.Blob.Name, lastModified: b.Blob.Properties["Last-Modified"] } });
            const latestMapped = filteredBlobs[filteredBlobs.length - 1].Name[0];

            const url = `https://c19pub.azureedge.net/${latestMapped}`;

            return url;
        }
    }

    private momentEqual(firstDate:string, secondDate:string): boolean {
        return moment(firstDate).isSame(moment(secondDate), "date");
    }
     
    private async getGbStatistics() : Promise<Epidemic | null> { 
        debugger;
        //Daily indicators.
        
        let url = await this.getLatestStatisticsUrl();


        if (url) {
            let response = await fetch(url);

            if (response && response.ok) {
                const json = await response.json();
                const typed = json as {
                    lastUpdatedAt: string,
                    disclaimer: string,
                    overview: {
                        [key: string]: {
                            name: valueAsString
                            totalCases: valueAsNumber
                            newCases: valueAsNumber
                            deaths: valueAsNumber
                            dailyDeaths: ({} & valueAsNumber & valueAsDate)[]
                            dailyTotalDeaths: ({} & valueAsNumber & valueAsDate)[]
                        };
                    },
                    countries: {
                        [key:string]: {
                            name: valueAsString
                            totalCases: valueAsNumber
                            deaths: valueAsNumber
                            dailyConfirmedCases: ({} & valueAsNumber & valueAsDate)[]
                            dailyTotalConfirmedCases: ({} & valueAsNumber & valueAsDate)[]
                            dailyDeaths: ({} & valueAsNumber & valueAsDate)[]
                            dailyTotalDeaths: ({} & valueAsNumber & valueAsDate)[]
                        }
                    }
                };
                
                let previousConfirmedCases: {cumulative: number, change: number, reportDate: string}[] = [];
                let previousConfirmedDeaths: {cumulative: number, change: number, reportDate: string}[] = [];
                const countryKeys = Object.keys(typed.countries);

                for(const key of countryKeys) {
                    if (typed.countries[key].dailyConfirmedCases) {
                        for (const dailyConfirmedCaseInCountry of typed.countries[key].dailyConfirmedCases) {
                            let previous = FindPrevious(previousConfirmedCases, dailyConfirmedCaseInCountry);
                            previous.change += dailyConfirmedCaseInCountry.value;
                        }
                    }
                    if (typed.countries[key].dailyTotalConfirmedCases) {
                        for (const totalConfirmedCaseInCountry of typed.countries[key].dailyTotalConfirmedCases) {
                            let previous = FindPrevious(previousConfirmedCases, totalConfirmedCaseInCountry);
                            previous.cumulative += totalConfirmedCaseInCountry.value;
                        }
                    }
                }

                //remove any figures where it does not contain an entry for dailyConfirmed, AND totalConfirmed.
                // previousConfirmedCases = previousConfirmedCases
                //     .filter(pcc => 
                //         countryKeys.every(
                //             key => {
                //                 return typed.countries[key].dailyConfirmedCases.some(dc => this.momentEqual(dc.date, pcc.reportDate)) 
                //                 && typed.countries[key].dailyTotalConfirmedCases.some(dc => this.momentEqual(dc.date, pcc.reportDate));
                //             } 
                //         )
                //     );

                const overviewKey = Object.keys(typed.overview)[0];
                const now = moment();
                
                //the rest of the figures can be extracted from summary.
                for(const dailyDeath of typed.overview[overviewKey].dailyDeaths) {
                    let previous = FindPrevious(previousConfirmedDeaths, dailyDeath);
                    previous.change += dailyDeath.value;
                }

                for(const cumulativeDeath of typed.overview[overviewKey].dailyTotalDeaths) {
                    let previous = FindPrevious(previousConfirmedDeaths, cumulativeDeath);
                    previous.cumulative += cumulativeDeath.value;
                }
                
                // previousConfirmedDeaths = previousConfirmedDeaths
                //     .filter(pcc => 
                //         countryKeys.every(
                //             key => {
                //                 return typed.countries[key].dailyDeaths.some(dc => this.momentEqual(dc.date, pcc.reportDate))
                //                 && typed.countries[key].dailyTotalDeaths.some(dc =>  this.momentEqual(dc.date, pcc.reportDate));
                //             } 
                //         )
                //     );

                // previousConfirmedCases = previousConfirmedCases.filter(c => exclusionDates.some(e => this.momentEqual(e, c.reportDate)) == false);
                // previousConfirmedDeaths = previousConfirmedDeaths.filter(c => exclusionDates.some(e => this.momentEqual(e, c.reportDate)) == false);

                //Get todays figures and substitute for the total cumulative as regions reports vary.
                
                let previous = FindPrevious(previousConfirmedCases, { date: now.toJSON() });
                
                if (previous != null) {
                    previous.cumulative = typed.overview[overviewKey].totalCases.value;
                    previous.change = typed.overview[overviewKey].newCases.value;
                }
                
                previous = FindPrevious(previousConfirmedDeaths, { date: now.toJSON() });

                if (previous != null) {
                    previous.cumulative = typed.overview[overviewKey].deaths.value;
                }

                previousConfirmedCases = previousConfirmedCases.sort((a,b) => moment(a.reportDate).valueOf() - moment(b.reportDate).valueOf());
                previousConfirmedDeaths = previousConfirmedDeaths.sort((a,b) => moment(a.reportDate).valueOf() - moment(b.reportDate).valueOf());
                
                const minutesPerWeek =  1 * 60 * 24 * 7;

                return {
                    cases: {
                        change: typed.overview[overviewKey].newCases.value,
                        cumulative: typed.overview[overviewKey].totalCases.value,
                        confirmedCasesGrowthRatePerMinute: 0,
                        reportDate: refactorDateToActual(new Date(typed.lastUpdatedAt)).toJSON(),
                        previousFigures: previousConfirmedCases
                    },
                    deaths: {
                        cumulative: typed.overview[overviewKey].deaths.value,
                        change: undefined,
                        confirmedCasesGrowthRatePerMinute: 0,
                        previousFigures: previousConfirmedDeaths,
                        reportDate: refactorDateToActual(new Date(typed.lastUpdatedAt)).toJSON()
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


            // const dailyIndicators = json.features[0].attributes;
            // //Previous figures.
            // response = await fetch("https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyConfirmedCases/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=DateVal%20asc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true");
            // console.trace(JSON.stringify(response));

            // if (response && response.ok) {
            //     const json = await response.json() as GovUk_ArcGIS_PreviousFiguresResponseType;

                // const previousConfirmedCases = json.features
                //     .filter(f => f.attributes.DateVal && f.attributes.CumCases)
                //     .map<{cumulative: number, change: number, reportDate: string}>(f => {
                //         return {
                //             cumulative: f.attributes.CumCases! ?? 0,
                //             change: f.attributes.CMODateCount! ?? 0,
                //             reportDate: refactorDateToActual(new Date(f.attributes.DateVal)).toJSON()
                //         }
                //     });
                    
                // const previousConfirmedDeaths = json.features
                //     .filter(f => f.attributes.DateVal && f.attributes.CumCases)
                //     .map<{cumulative: number, change: number, reportDate: string}>(f => {
                //         return {
                //             cumulative: f.attributes.CumDeaths! ?? 0,
                //             change: f.attributes.DailyDeaths! ?? 0,
                //             reportDate: refactorDateToActual(new Date(f.attributes.DateVal)).toJSON()
                //         }
                //     });

                 
        return null;
    }
}

function FindPrevious(previousConfirmedCases: { cumulative: number; change: number; reportDate: string; }[], itemToFind: valueAsDate) {
    let previous = previousConfirmedCases.find(pcc => moment(pcc.reportDate).isSame(moment(itemToFind.date), "date"));
    if (previous == undefined) {
        previous = { change: 0, cumulative: 0, reportDate: moment(itemToFind.date).toJSON() };
        previousConfirmedCases.push(previous);
    }
    return previous;
}

