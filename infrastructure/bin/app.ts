#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SecurityStack } from '../lib/security-stack';

// Additional stacks can be imported here as they are implemented.
// import { DatabaseStack } from '../lib/database-stack';
// import { AuthStack } from '../lib/auth-stack';

const app = new cdk.App();

// Resolve the deployment environment from CDK context, defaulting to dev.
const envName = app.node.tryGetContext('env') || 'dev';

new SecurityStack(app, `MusicStoreSecurityStack-${envName}`);

// Enable these stacks after their implementations are added.
/*
const databaseStack = new DatabaseStack(app, `MusicStoreDatabaseStack-${envName}`, {
  envName,
});

const authStack = new AuthStack(app, `MusicStoreAuthStack-${envName}`, {
  envName,
});
*/

app.synth();
