import { loggerMiddleware } from '@shared/middlewares/loggerMiddleware';
import { Request, Response, NextFunction } from 'express';

describe('loggerMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            method: 'GET',
            originalUrl: '/test-url'
        };
        res = {};
        next = jest.fn();
        console.log = jest.fn();
    });

    it('should log the request method and URL', () => {
        const date = new Date().toISOString();
        jest.spyOn(global, 'Date').mockImplementation(() => ({
            toISOString: () => date
        } as unknown as Date));

        loggerMiddleware(req as Request, res as Response, next);

        expect(console.log).toHaveBeenCalledWith(`${date} - GET /test-url`);
        expect(next).toHaveBeenCalled();
    });
});
