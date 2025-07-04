import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const tableName = process.env.TABLE_NAME!;
const db = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const shortCode = event.pathParameters?.shortCode;

    if (!shortCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing short code' }),
      };
    }

    const result = await db
      .get({
        TableName: tableName,
        Key: { shortCode },
      })
      .promise();

    const item = result.Item;

    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Short URL not found' }),
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: item.originalUrl,
      },
      body: '',
    };
  } catch (error) {
    console.error('Redirect error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

