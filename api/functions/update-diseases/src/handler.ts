
import fetch from "node-fetch"; 
import merge from "lodash.merge";
import * as AWS from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";
import { S3, AWSError } from "aws-sdk";

const s3 = new AWS.S3();

export class DiseaseListHandler  {
    private bucketName: string;

    constructor(bucketName: string) {        
        this.bucketName = bucketName;
    }
    
    public async updateDiseasesForAllCountries() : Promise<void> {
        //get a list of countries with disease files
        let listObjectResult:PromiseResult<S3.ListObjectsV2Output, AWSError> | null = null;
        
        let diseasesAndCountries: {countryCode:string, diseases:string[]}[] = [];

        do {
            listObjectResult = await s3.listObjectsV2({ Bucket: this.bucketName, Prefix: "api/countries/" }).promise();
            
            if (listObjectResult.Contents) {
                for (let item of listObjectResult.Contents!) {
                    let capturingRegex = new RegExp("api\/countries\/(?<countryCode>[^\/]+)\/diseases\/(?<disease>.*)\.json", "gim");
                    let match = capturingRegex.exec(item.Key!);

                    if (match && match.groups && match.groups["disease"] != "diseases") {
                        let country = diseasesAndCountries.find(dc => dc.countryCode == match?.groups!["countryCode"]);

                        if (country == undefined) {
                            country = {
                                countryCode: match?.groups!["countryCode"],
                                diseases: []
                            };
                            diseasesAndCountries.push(country);
                        }

                        country.diseases.push(match.groups!["disease"]);
                    }
                    
                }    
            }

        } while (listObjectResult != null && listObjectResult.IsTruncated);

        for (const item of diseasesAndCountries) {
            await this.updateDiseaseListForCountry(item.countryCode, item.diseases);
        }
    }

    public async updateDiseaseListForCountry(countryCode:string, diseases:string[]) : Promise<void> {
        const key = `api/countries/${countryCode}/diseases/diseases.json`

        const diseaseFormat = diseases.map<{name:string}>(disease => { return {name: disease} });

        try {
            await s3.putObject(
                {
                    Bucket: this.bucketName,
                    Key: key,
                    ACL: 'public-read',
                    Body: JSON.stringify(diseaseFormat),
                    ContentType: "application/json",
                    Metadata: {
                        "Cache-Control": "max-age=3600"
                    }
                }).promise();
        } catch (error) {
            debugger;
            console.error(error);
        }
    }
}

