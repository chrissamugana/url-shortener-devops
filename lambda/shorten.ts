import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    if (!body || !body.url) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'URL is required'
        }),
      };
    }
    
    // Generate a short code
    const shortCode = uuidv4().substring(0, 8);
    
    // Store in DynamoDB
    const params = {
      TableName: process.env.TABLE_NAME,
      Item: {
        shortCode: shortCode,
        originalUrl: body.url,
        createdAt: new Date().toISOString(),
      },
    };
    
    await docClient.send(new PutCommand(params));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        shortCode: shortCode,
        originalUrl: body.url,
      }),
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