jest.mock('../../models/event.model', () => ({
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn()
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');
const Event = require('../../models/event.model');
const app = require('../../app');

const buildEventQuery = (events) => ({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: (resolve) => resolve(events)
});

describe('Events API', () => {
    beforeEach(() => {
        Event.find.mockReturnValue(buildEventQuery([{ title: 'Test event' }]));
        Event.findById.mockReturnValue(buildEventQuery({ _id: '507f1f77bcf86cd799439011', title: 'Test event' }));
        Event.countDocuments.mockResolvedValue(1);
        Event.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', title: 'Created event' });
    });

    test('GET /api/events returns a successful event list', async () => {
        const response = await request(app).get('/api/events');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/events without a JWT returns 401', async () => {
        const response = await request(app)
            .post('/api/events')
            .send({
                title: 'Test event',
                description: 'A test event',
                category: '507f1f77bcf86cd799439011',
                date: '2026-09-01',
                city: 'Cairo',
                venue: 'Hall',
                capacity: 20
            });

        expect(response.status).toBe(401);
    });

    test('POST /api/events with missing fields returns 422', async () => {
        const response = await request(app)
            .post('/api/events')
            .send({});

        expect(response.status).toBe(422);
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.some((error) => error.field === 'title')).toBe(true);
    });

    test('admin can create an event', async () => {
        const token = jwt.sign({ userId: '507f1f77bcf86cd799439012', role: 'admin' }, process.env.JWT_SECRET);
        const response = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Created event',
                description: 'A created event',
                category: '507f1f77bcf86cd799439011',
                date: '2026-09-01',
                city: 'Cairo',
                venue: 'Hall',
                capacity: 20
            });

        expect(response.status).toBe(201);
        expect(Event.create).toHaveBeenCalledWith(expect.objectContaining({ organizer: '507f1f77bcf86cd799439012' }));
    });

    test('GET /api/events/:id returns one event', async () => {
        const response = await request(app).get('/api/events/507f1f77bcf86cd799439011');

        expect(response.status).toBe(200);
        expect(response.body.data.title).toBe('Test event');
    });
});