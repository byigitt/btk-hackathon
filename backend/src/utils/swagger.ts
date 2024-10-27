import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mayıs API',
      version: '1.0.0',
      description: 'API for Mayıs backend',
    },
  },
  apis: ['./src/core/routes.ts'], // path to the API docs
};

export const specs = swaggerJsdoc(options);

// Remove the type annotation for swaggerServe
export const swaggerServe = swaggerUi.serve;

// For swaggerSetup, we can use a more general type
export const swaggerSetup = swaggerUi.setup(specs) as unknown as (req: any, res: any, next: any) => void;
