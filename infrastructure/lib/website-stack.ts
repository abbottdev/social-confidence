import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { Duration } from '@aws-cdk/core';

export class WebsiteStack extends cdk.Stack {
    public Bucket: s3.Bucket;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const [recordName, domainName] = ['covid', 'abbott.rocks'];

        // The code that defines your stack goes here
        this.Bucket = new s3.Bucket(
            this, "WebsiteBucket", {
                publicReadAccess: true,
                bucketName: [recordName, domainName].join('.'),
                websiteIndexDocument: "index.html",
                websiteErrorDocument: "index.html",
                removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
            }
        );

        const zone = route53.HostedZone.fromLookup(this, 'Zone', {domainName}); // covid.abbott.rocks
        const siteDomain = recordName + '.' +  domainName;
        new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

        // TLS certificate
        // const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
        //     domainName: "*." + domainName,
        //     hostedZone: zone
        // }).certificateArn;
        // new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });

        // CloudFront distribution that provides HTTPS
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
            aliasConfiguration: {
                acmCertRef: "arn:aws:acm:us-east-1:158176244280:certificate/2186fb34-980f-4cd8-8f26-8f9294ce29fe",
                names: [ siteDomain ],
                sslMethod: cloudfront.SSLMethod.SNI,
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
            },
            errorConfigurations: [
                { errorCode: 404, responseCode: 200, responsePagePath: "/index.html", errorCachingMinTtl: 3600 },
                { errorCode: 403, responseCode: 200, responsePagePath: "/index.html", errorCachingMinTtl: 3600 }
            ],
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.Bucket
                    },
                    behaviors : [ {isDefaultBehavior: true, defaultTtl: Duration.minutes(10) }],
                }
            ]
        });
        new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

        // Route53 alias record for the CloudFront distribution
        new route53.ARecord(this, 'SiteAliasRecord', {
            recordName: siteDomain,
            target: route53.AddressRecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
            zone
        });

        // Deploy site contents to S3 bucket
        new s3Deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [ s3Deploy.Source.asset('../client/build/') ],
            destinationBucket: this.Bucket,
            distribution,
            distributionPaths: ['/*'],
        });
    }
}
