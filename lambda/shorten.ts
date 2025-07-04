import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { nanoid } from 'nanoid';

const tableName = process.env.TABLE_NAME!;
const db = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const originalUrl = body.url;

    if (!originalUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'URL is required' }),
      };
    }

    const shortCode = nanoid(6);

    await db
      .put({
        TableName: tableName,
        Item: {
          shortCode,
          originalUrl,
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        shortCode,
        shortUrl: `https://${event.headers.Host}/${shortCode}`,
      }),
    };
  } catch (error) {
    console.error('Error creating short URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
