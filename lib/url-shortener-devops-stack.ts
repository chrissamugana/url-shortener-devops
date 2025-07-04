import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class UrlShortenerDevopsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'UrlShortenerTable', {
      partitionKey: { name: 'shortCode', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only use DESTROY for dev
    });

    // Lambda Function for URL Shortening using NodejsFunction
    const shortenFn = new NodejsFunction(this, 'ShortenFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/shorten.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        externalModules: ['aws-sdk'], // Use AWS SDK provided by Lambda runtime
      },
    });

    // Lambda Function for URL Redirection using NodejsFunction
    const redirectFn = new NodejsFunction(this, 'RedirectFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/redirect.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        externalModules: ['aws-sdk'], // Use AWS SDK provided by Lambda runtime
      },
    });

    // Grant DynamoDB permissions to Lambda functions
    table.grantReadWriteData(shortenFn);
    table.grantReadData(redirectFn);

    // API Gateway setup
    const api = new apigateway.RestApi(this, 'UrlShortenerAPI', {
      restApiName: 'URL Shortener Service',
      description: 'A simple URL shortener service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type'],
      },
    });

    // POST /shorten → ShortenFunction
    const shortenResource = api.root.addResource('shorten');
    shortenResource.addMethod('POST', new apigateway.LambdaIntegration(shortenFn));

    // GET /{shortCode} → RedirectFunction
    const redirectResource = api.root.addResource('{shortCode}');
    redirectResource.addMethod('GET', new apigateway.LambdaIntegration(redirectFn));

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'URL of the API Gateway',
    });
  }
}