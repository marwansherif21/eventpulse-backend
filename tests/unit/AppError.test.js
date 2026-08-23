const AppError = require('../../utils/AppError');

describe('AppError', () => {
    test('sets fail status for client errors', () => {
        const error = new AppError('Not found', 404);

        expect(error.statusCode).toBe(404);
        expect(error.status).toBe('fail');
    });

    test('sets error status for server errors', () => {
        expect(new AppError('Server error', 500).status).toBe('error');
    });

    test('is operational and extends Error', () => {
        const error = new AppError('Expected error', 400);

        expect(error.isOperational).toBe(true);
        expect(error).toBeInstanceOf(Error);
    });
});