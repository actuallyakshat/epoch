import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Epoch Share Server API',
      version: '1.0.0',
      description: 'API for sharing data temporarily via short codes',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ExportRequest: {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              description: 'Any JSON object to share',
              example: { message: 'Hello World', timestamp: 1234567890 },
            },
          },
        },
        ExportResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: '8-character code to retrieve the data',
              example: 'abc12345',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp when the data expires',
              example: '2026-01-04T18:30:00.000Z',
            },
          },
        },
        ImportRequest: {
          type: 'object',
          required: ['code'],
          properties: {
            code: {
              type: 'string',
              description: '8-character code received from export',
              example: 'abc12345',
            },
          },
        },
        ImportResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              description: 'The shared JSON object',
              example: { message: 'Hello World', timestamp: 1234567890 },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Missing data field',
            },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          description: 'Check if the server is running',
          responses: {
            200: {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'ok',
                      },
                      redis: {
                        type: 'string',
                        example: 'connected',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/data/export': {
        post: {
          tags: ['Data'],
          summary: 'Export data and get a share code',
          description: 'Store data temporarily and receive an 8-character code to share',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExportRequest',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Data exported successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExportResponse',
                  },
                },
              },
            },
            400: {
              description: 'Bad request - invalid data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/data/import': {
        post: {
          tags: ['Data'],
          summary: 'Import data using a share code',
          description: 'Retrieve shared data using an 8-character code',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ImportRequest',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Data retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ImportResponse',
                  },
                },
              },
            },
            400: {
              description: 'Bad request - invalid code format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            404: {
              description: 'Data not found or expired',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
