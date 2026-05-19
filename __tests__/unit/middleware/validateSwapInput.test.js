import { describe, test, expect, vi } from 'vitest';
import { validateSwapInput } from '../../../src/middlewares/validateSwapInput.js';

describe('validateSwapInput middleware', () => {
    test('should call next() when all required fields are present', () => {
        const req = {
            body: {
                name: 'Sir Testalot',
                email: 'sir@testalot.com',
                password: 'password',
                itemName: 'Camera',
                itemDescription: 'A nice camera'
            }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        const next = vi.fn();

        validateSwapInput(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when required fields are missing', () => {
        const req = {
            body: {
                name: 'Sir Testalot',
                email: 'sir@testalot.com'
            }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        const next = vi.fn();

        validateSwapInput(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Please fill in all fields." });
        expect(next).not.toHaveBeenCalled();
    });
});