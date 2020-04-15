import * as cdk from '@aws-cdk/core';
import * as targets from '@aws-cdk/aws-events-targets';
import * as events from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import { Code, RuntimeFamily, Runtime } from '@aws-cdk/aws-lambda';
import { Bucket } from '@aws-cdk/aws-s3';
import { Schedule, Rule, RuleTargetInput } from '@aws-cdk/aws-events';
import * as customResources from "@aws-cdk/custom-resources";
import * as customResourcesFramework from "@aws-cdk/custom-resources/test/provider-framework/integ.provider";
import { ISynthesisSession } from '@aws-cdk/core';

export class ApiStack extends cdk.Stack {
  public lambda: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps & {WebsiteBucket: Bucket}) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.lambda = new lambda.Function(this, "UpdateGbStatisticsLambda", {
        code: Code.fromAsset("../api/functions/update-statistics/dist/"),
        handler: "index.handler",
        runtime: Runtime.NODEJS_12_X
    });

    const updateDiseaseListLambda = new lambda.Function(this, "UpdateDiseaseListLambda", {
        code: Code.fromAsset("../api/functions/update-diseases/dist/"),
        handler: "index.handler",
        runtime: Runtime.NODEJS_12_X
    });

    props?.WebsiteBucket.grantReadWrite(this.lambda);
    props?.WebsiteBucket.grantReadWrite(updateDiseaseListLambda);
    
    const target = new targets.LambdaFunction(this.lambda, {
        event: RuleTargetInput.fromObject({bucketName: props?.WebsiteBucket.bucketName})
    });

    new Rule(this, 'UpdateStatistics-GB', {
        schedule: Schedule.cron({ hour: "16", minute: "0"}),
        targets: [target],
        enabled: false
    });

    const updateDiseaseListLambdaTarget = new targets.LambdaFunction(updateDiseaseListLambda, {
        event: RuleTargetInput.fromObject({bucketName: props?.WebsiteBucket.bucketName})
    });

    new Rule(this, 'UpdateDiseasesList', {
        schedule: Schedule.cron({ weekDay: "SUN", hour: "23", minute: "0"}),
        targets: [updateDiseaseListLambdaTarget],
        enabled: false
    });
  } 
}
