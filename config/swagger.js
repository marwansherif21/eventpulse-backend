const swaggerJSDoc = require('swagger-jsdoc');

module.exports = swaggerJSDoc({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'EventPulse API',
            version: '1.0.0',
            description: 'Event discovery, registration, authentication, and real-time announcements API.'
        },
        servers: [{ url: '/' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                Event: {
                    type: 'object',
                    required: ['title', 'description', 'category', 'date', 'city', 'venue', 'capacity'],
                    properties: {
                        title: { type: 'string', example: 'Future of Web Development' },
                        description: { type: 'string', example: 'A practical web development conference.' },
                        category: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        date: { type: 'string', format: 'date-time', example: '2026-09-15T09:00:00Z' },
                        city: { type: 'string', example: 'New York' },
                        venue: { type: 'string', example: 'Hudson Hall' },
                        capacity: { type: 'number', example: 300 }
                    }
                }
            }
        }
    },
    apis: []
});

module.exports.paths = {
    '/api/auth/register': {
        post: {
            tags: ['Auth'], summary: 'Register a user',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } } } } } },
            responses: { 201: { description: 'User registered' }, 409: { description: 'Duplicate email' }, 422: { description: 'Validation error' } }
        }
    },
    '/api/auth/login': {
        post: {
            tags: ['Auth'], summary: 'Log in a user',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } } },
            responses: { 200: { description: 'JWT issued' }, 401: { description: 'Invalid credentials' }, 422: { description: 'Validation error' } }
        }
    },
    '/api/events': {
        get: {
            tags: ['Events'], summary: 'List events',
            parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'city', in: 'query', schema: { type: 'string' } }, { name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }, { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['date', 'registrations'] } }, { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }],
            responses: { 200: { description: 'Paginated event list' } }
        },
        post: {
            tags: ['Events'], summary: 'Create an event', security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/Event' } } } },
            responses: { 201: { description: 'Event created' }, 401: { description: 'Authentication required' }, 403: { description: 'Admin role required' }, 422: { description: 'Validation error' } }
        }
    },
    '/api/events/{id}': {
        get: { tags: ['Events'], summary: 'Get an event', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Event details' }, 404: { description: 'Event not found' } } },
        patch: { tags: ['Events'], summary: 'Update an event', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { '$ref': '#/components/schemas/Event' } } } }, responses: { 200: { description: 'Event updated' }, 401: { description: 'Authentication required' }, 403: { description: 'Admin role required' }, 422: { description: 'Validation error' } } },
        delete: { tags: ['Events'], summary: 'Delete an event', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Event deleted' }, 401: { description: 'Authentication required' }, 403: { description: 'Admin role required' } } }
    }
};