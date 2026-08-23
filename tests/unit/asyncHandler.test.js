const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler', () => {
    test('passes request arguments to the wrapped controller', () => {
        const controller = jest.fn();
        const req = {};
        const res = {};
        const next = jest.fn();

        asyncHandler(controller)(req, res, next);

        expect(controller).toHaveBeenCalledWith(req, res, next);
    });

    test('forwards rejected errors to next', async () => {
        const error = new Error('Database unavailable');
        const next = jest.fn();

        asyncHandler(async () => {
            throw error;
        })({}, {}, next);

        await new Promise(setImmediate);
        expect(next).toHaveBeenCalledWith(error);
    });
});