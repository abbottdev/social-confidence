import { updateGbStatistics } from "./handler";
import AWS, { SharedIniFileCredentials } from "aws-sdk";

debugger;

AWS.config.credentials = new SharedIniFileCredentials({profile: "personal"});
AWS.config.region = "eu-west-2";

(async() => {
    await updateGbStatistics();

})();
