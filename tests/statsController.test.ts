import { getStatistics } from '../src/controllers/statisticsController';
import request from 'supertest';
import express from 'express';
import Redis from 'ioredis';
import fs from 'fs';

// mock the modules
jest.mock('ioredis');
jest.mock('fs');
jest.mock('path');

// initialize Express app and define the route
const app = express();
app.get('/api/statistics', getStatistics);

describe('GET /api/statistics', () => {
    beforeEach(() => {
        // reset all mocks before each test
        jest.resetAllMocks();
    });

    it('should return correct statistics', async () => {
        // mock the file system and Redis client responses
        (fs.readdirSync as jest.Mock).mockReturnValue(['image.png', 'image.jpg']);
        (Redis.prototype.get as jest.Mock).mockImplementation((key: string) => {
            switch (key) {
                case 'resizedImages': return '1';
                case 'cacheHits': return '5';
                case 'cacheMisses': return '3';
                case 'totalRequests': return '8';
                case 'totalErrors': return '1';
                case 'averageProcessingTime': return '123.45';
                case 'mostRequestedResolutions': return JSON.stringify({ '400x400': 3, '200x200': 2 });
                case 'mostRequestedImages': return JSON.stringify({ 'image.png': 5, 'image.jpg': 3 });
                default: return null;
            }
        });
        (Redis.prototype.dbsize as jest.Mock).mockReturnValue(Promise.resolve(10));

        // make the request to the endpoint
        const res = await request(app).get('/api/statistics');

        // verify the response status
        expect(res.status).toBe(200);

        // verify the response body
        expect(res.body).toEqual({
            totalImages: 2,
            resizedImages: 1,
            cacheHits: 5,
            cacheMisses: 3,
            totalRequests: 8,
            totalErrors: 1,
            averageProcessingTime: '123.45 ms',
            mostRequestedResolutions: { '400x400': 3, '200x200': 2 },
            mostRequestedImages: { 'image.png': 5, 'image.jpg': 3 },
            cacheSize: 10,
            cacheHitMissRatio: '1.67',
            requestSuccessErrorRatio: '7.00'
        });
    });

    it('should handle cases with no cache misses', async () => {
        // mock the file system and Redis client responses for no cache misses
        (fs.readdirSync as jest.Mock).mockReturnValue(['image.png', 'image.jpg']);
        (Redis.prototype.get as jest.Mock).mockImplementation((key: string) => {
            switch (key) {
                case 'resizedImages': return '1';
                case 'cacheHits': return '5';
                case 'cacheMisses': return '0';
                case 'totalRequests': return '8';
                case 'totalErrors': return '1';
                case 'averageProcessingTime': return '123.45';
                case 'mostRequestedResolutions': return JSON.stringify({ '400x400': 3, '200x200': 2 });
                case 'mostRequestedImages': return JSON.stringify({ 'image.png': 5, 'image.jpg': 3 });
                default: return null;
            }
        });
        (Redis.prototype.dbsize as jest.Mock).mockReturnValue(Promise.resolve(10));

        // make request to the endpoint
        const res = await request(app).get('/api/statistics');

        // verify response status
        expect(res.status).toBe(200);

        // verify response body
        expect(res.body).toEqual({
            totalImages: 2,
            resizedImages: 1,
            cacheHits: 5,
            cacheMisses: 0,
            totalRequests: 8,
            totalErrors: 1,
            averageProcessingTime: '123.45 ms',
            mostRequestedResolutions: { '400x400': 3, '200x200': 2 },
            mostRequestedImages: { 'image.png': 5, 'image.jpg': 3 },
            cacheSize: 10,
            cacheHitMissRatio: 'N/A',
            requestSuccessErrorRatio: '7.00'
        });
    });

    it('should handle cases with no errors', async () => {
        // mock the file system and Redis client responses for no errors
        (fs.readdirSync as jest.Mock).mockReturnValue(['image.png', 'image.jpg']);
        (Redis.prototype.get as jest.Mock).mockImplementation((key: string) => {
            switch (key) {
                case 'resizedImages': return '1';
                case 'cacheHits': return '5';
                case 'cacheMisses': return '3';
                case 'totalRequests': return '8';
                case 'totalErrors': return '0';
                case 'averageProcessingTime': return '123.45';
                case 'mostRequestedResolutions': return JSON.stringify({ '400x400': 3, '200x200': 2 });
                case 'mostRequestedImages': return JSON.stringify({ 'image.png': 5, 'image.jpg': 3 });
                default: return null;
            }
        });
        (Redis.prototype.dbsize as jest.Mock).mockReturnValue(Promise.resolve(10));

        // make the request to the endpoint
        const res = await request(app).get('/api/statistics');

        // verify response status
        expect(res.status).toBe(200);

        // verify response body
        expect(res.body).toEqual({
            totalImages: 2,
            resizedImages: 1,
            cacheHits: 5,
            cacheMisses: 3,
            totalRequests: 8,
            totalErrors: 0,
            averageProcessingTime: '123.45 ms',
            mostRequestedResolutions: { '400x400': 3, '200x200': 2 },
            mostRequestedImages: { 'image.png': 5, 'image.jpg': 3 },
            cacheSize: 10,
            cacheHitMissRatio: '1.67',
            requestSuccessErrorRatio: 'N/A'
        });
    });

    it('should handle cases with no cache hits', async () => {
        // mock the file system and Redis client responses for no cache hits
        (fs.readdirSync as jest.Mock).mockReturnValue(['image.png', 'image.jpg']);
        (Redis.prototype.get as jest.Mock).mockImplementation((key: string) => {
            switch (key) {
                case 'resizedImages': return '1';
                case 'cacheHits': return '0';
                case 'cacheMisses': return '3';
                case 'totalRequests': return '8';
                case 'totalErrors': return '1';
                case 'averageProcessingTime': return '123.45';
                case 'mostRequestedResolutions': return JSON.stringify({ '400x400': 3, '200x200': 2 });
                case 'mostRequestedImages': return JSON.stringify({ 'image.png': 5, 'image.jpg': 3 });
                default: return null;
            }
        });
        (Redis.prototype.dbsize as jest.Mock).mockReturnValue(Promise.resolve(10));

        // make the request to the endpoint
        const res = await request(app).get('/api/statistics');

        // verify response status
        expect(res.status).toBe(200);

        // verify response body
        expect(res.body).toEqual({
            totalImages: 2,
            resizedImages: 1,
            cacheHits: 0,
            cacheMisses: 3,
            totalRequests: 8,
            totalErrors: 1,
            averageProcessingTime: '123.45 ms',
            mostRequestedResolutions: { '400x400': 3, '200x200': 2 },
            mostRequestedImages: { 'image.png': 5, 'image.jpg': 3 },
            cacheSize: 10,
            cacheHitMissRatio: '0.00',
            requestSuccessErrorRatio: '7.00'
        });
    });

    it('should handle cases where Redis returns null', async () => {
        // mock the file system and Redis client responses for null values
        (fs.readdirSync as jest.Mock).mockReturnValue(['image.png', 'image.jpg']);
        (Redis.prototype.get as jest.Mock).mockResolvedValue(null);
        (Redis.prototype.dbsize as jest.Mock).mockReturnValue(Promise.resolve(10));

        // make request to the endpoint
        const res = await request(app).get('/api/statistics');

        // verify response status
        expect(res.status).toBe(200);

        // verify response body
        expect(res.body).toEqual({
            totalImages: 2,
            resizedImages: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalRequests: 0,
            totalErrors: 0,
            averageProcessingTime: '0.00 ms',
            mostRequestedResolutions: {},
            mostRequestedImages: {},
            cacheSize: 10,
            cacheHitMissRatio: 'N/A',
            requestSuccessErrorRatio: 'N/A'
        });
    });

    it('should handle errors', async () => {
        // mock the Redis client to throw an error
        (Redis.prototype.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

        // make the request to the endpoint
        const res = await request(app).get('/api/statistics');

        // verify response status
        expect(res.status).toBe(500);

        // verify response body
        expect(res.text).toBe('Error retrieving statistics!');
    });
});
