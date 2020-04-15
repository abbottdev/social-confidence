#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiStack } from './api-stack';
import { WebsiteStack } from './website-stack';
import { buildDependencies } from './deps';

(async() => {
    await buildDependencies();
    
    let params = {
        env: { 
          account: process.env.CDK_DEFAULT_ACCOUNT, 
          region: process.env.CDK_DEFAULT_REGION 
      }
    };

    const app = new cdk.App();

    const websitestack = new WebsiteStack(app, "WebsiteStack", params);

    new ApiStack(app, 'ApiStack', {...params, WebsiteBucket: websitestack.Bucket});


})();