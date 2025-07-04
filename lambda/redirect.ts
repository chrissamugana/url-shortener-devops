import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get the short code from the path parameters
    const shortCode = event.pathParameters?.shortCode;
    
    if (!shortCode) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Short code is required'
        }),
      };
    }
    
    // Get the original URL from DynamoDB
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        shortCode: shortCode,
      },
    };
    
    const result = await docClient.send(new GetCommand(params));
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Short code not found'
        }),
      };
    }
    
    // Redirect to the original URL
    return {
      statusCode: 302,
      headers: {
        'Location': result.Item.originalUrl,
        'Access-Control-Allow-Origin': '*',
      },
      body: '',
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
