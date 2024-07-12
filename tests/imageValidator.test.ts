import { validateImageRequest } from '../src/validators/imageValidator';
import express, { Request, Response } from 'express';
import request from 'supertest';
import Redis from 'ioredis';

// mock Redis client
jest.mock('ioredis');

// initialize Express app and define the route
const app = express();
app.use(express.json());
app.get('/api/images/:filename', validateImageRequest, (_: Request, res: Response) => res.status(200).send('OK'));

describe('Image Validator Middleware', () => {
    beforeEach(() => {
        // reset all mocks before each test
        jest.resetAllMocks();
    });

    it('should pass with valid filename and resolution', async () => {
        // make a request with a valid filename and resolution
        const res = await request(app)
            .get('/api/images/example.jpg')
            .query({ resolution: '800x600' });

        // expect the request to pass and return a 200 status
        expect(res.status).toBe(200);
        expect(res.text).toBe('OK');
    });

    it('should fail with invalid filename extension', async () => {
        // make a request with an invalid filename extension
        const res = await request(app)
            .get('/api/images/example.txt');

        // expect the request to fail and return a 400 status with a specific error message
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Image name must have a valid file extension!' })
        ]));
    });

    it('should fail with empty filename', async () => {
        // make a request with an empty filename
        const res = await request(app)
            .get('/api/images/');

        // expect the request to fail and return a 404 status
        expect(res.status).toBe(404);
    });

    it('should fail with missing filename', async () => {
        // make a request with a missing filename
        const res = await request(app)
            .get('/api/images');

        // expect the request to fail and return a 404 status
        expect(res.status).toBe(404);
    });

    it('should fail with invalid resolution format', async () => {
        // make a request with an invalid resolution format
        const res = await request(app)
            .get('/api/images/sample.jpg')
            .query({ resolution: '800x' });

        // expect the request to fail and return a 400 status with specific error message
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Resolution must be in the format {width}x{height}!' })
        ]));
    });

    it('should fail with non-string resolution', async () => {
        // make a request with a non-string resolution
        const res = await request(app)
            .get('/api/images/sample.jpg')
            .query({ resolution: 800 });

        // expect the request to fail and return a 400 status with specific error message
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Resolution must be in the format {width}x{height}!' })
        ]));
    });

    it('should handle Redis errors', async () => {
        // mock Redis error
        (Redis.prototype.incr as jest.Mock).mockRejectedValue(new Error('Redis error'));

        // make a request with a valid filename and resolution
        const res = await request(app)
            .get('/api/images/sample.jpg')
            .query({ resolution: '800x600' });

        // expect the request to pass and return a 200 status despite Redis error
        expect(res.status).toBe(200);
    });
});
