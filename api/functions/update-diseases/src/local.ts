import AWS, { SharedIniFileCredentials } from "aws-sdk";

AWS.config.credentials = new SharedIniFileCredentials({profile: "personal"});
AWS.config.region = "eu-west-2";

const bucketName = 'covid.abbott.rocks';

(async() => {
    //Use late import to allow the AWS Config credentials to be set.
    const handlerType = await import("./handler");

    let handler = new handlerType.DiseaseListHandler(bucketName);

    await handler.updateDiseasesForAllCountries();

})();
