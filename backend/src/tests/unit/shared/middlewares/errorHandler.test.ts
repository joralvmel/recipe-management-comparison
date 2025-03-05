import { errorHandler } from '@shared/middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@shared/errors/customErrors';

describe('errorHandler', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            headersSent: false
        };
        next = jest.fn();
    });

    it('should log the error and send a 500 response with the error message', () => {
        const error = new Error('Test error');
        console.error = jest.fn();

        errorHandler(error, req as Request, res as Response, next);

        expect(console.error).toHaveBeenCalledWith(`[Error] ${error.message}`);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });

    it('should call next if headers are already sent', () => {
        res.headersSent = true;
        const error = new Error('Test error');

        errorHandler(error, req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it('should use the error status if provided', () => {
        const error: CustomError = { name: 'CustomError', message: 'Test error', status: 400 };

        errorHandler(error, req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });

    it('should use a default error message if none is provided', () => {
        const error: CustomError = { name: 'CustomError', message: 'Internal Server Error', status: 500 };

        errorHandler(error, req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});
