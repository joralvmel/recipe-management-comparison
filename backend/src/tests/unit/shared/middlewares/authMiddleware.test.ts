import { authMiddleware, AuthenticatedRequest } from '@shared/middlewares/authMiddleware';
import { UnauthorizedError } from '@shared/errors/customErrors';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

describe('authMiddleware', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {};
        next = jest.fn();
    });

    it('should call next with UnauthorizedError if no token is provided', () => {
        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(next).toHaveBeenCalledWith(new UnauthorizedError('No token provided'));
    });

    it('should call next with UnauthorizedError if token is invalid', () => {
        req.headers!.authorization = 'Bearer invalidtoken';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(next).toHaveBeenCalledWith(new UnauthorizedError('Invalid token'));
    });

    it('should call next with UnauthorizedError if token has expired', () => {
        req.headers!.authorization = 'Bearer expiredtoken';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new jwt.TokenExpiredError('Token has expired', new Date());
        });

        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(next).toHaveBeenCalledWith(new UnauthorizedError('Token has expired'));
    });

    it('should set req.user and call next if token is valid', () => {
        const user = { id: '123', email: 'test@example.com' };
        req.headers!.authorization = 'Bearer validtoken';
        jest.spyOn(jwt, 'verify').mockImplementation(() => user);

        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalled();
    });
});
