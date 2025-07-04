import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class UrlShortenerDevopsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'UrlShortenerTable', {
      partitionKey: { name: 'shortCode', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use DESTROY only for dev environments
    });

    // Lambda Function for URL Shortening
    const shortenFn = new lambda.Function(this, 'ShortenFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shorten.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Lambda Function for URL Redirection
    const redirectFn = new lambda.Function(this, 'RedirectFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'redirect.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant DynamoDB permissions to Lambda functions
    table.grantReadWriteData(shortenFn);
    table.grantReadData(redirectFn);

    // API Gateway setup
    const api = new apigateway.RestApi(this, 'UrlShortenerAPI', {
      restApiName: 'URL Shortener Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST'],
      },
    });

    // POST /shorten → ShortenFunction
    const shortenResource = api.root.addResource('shorten');
    shortenResource.addMethod('POST', new apigateway.LambdaIntegration(shortenFn));

    // GET /{shortCode} → RedirectFunction
    const redirectResource = api.root.addResource('{shortCode}');
    redirectResource.addMethod('GET', new apigateway.LambdaIntegration(redirectFn));
  }
}
