import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

/**
 * Mounts Swagger UI and the raw OpenAPI JSON spec.
 *
 * Routes:
 *   GET /api-docs        → interactive Swagger UI
 *   GET /api-docs.json   → raw OpenAPI specification
 */
export const setupApiDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
};

export default setupApiDocs;