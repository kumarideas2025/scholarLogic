import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

/**
 * Swagger / OpenAPI Configuration
 *
 * Generates an OpenAPI 3.0 spec describing the public REST API. Served at
 * /api-docs (Swagger UI) and /api-docs.json (raw spec). Keeping the spec
 * generated from code (with inline annotations) prevents doc/implementation
 * drift.
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ScholarLogic API',
      version: '1.0.0',
      description:
        'Production-ready REST API for the ScholarLogic educational platform. ' +
        'Implements JWT auth, RBAC, courses, assignments, resources, notifications, and admin analytics.',
      contact: { name: 'ScholarLogic', email: 'support@scholarlogic.com' },
    },
    servers: [
      { url: `http://localhost:${config.port}/api/v1`, description: 'Local' },
      { url: config.clientUrl + '/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['student', 'teacher', 'admin'] },
            status: { type: 'string' },
            avatar: { type: 'string' },
            isEmailVerified: { type: 'boolean' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string' },
                accessTokenExpiry: { type: 'number' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;