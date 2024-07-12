import { getImage } from '../src/controllers/imageController';
import request from 'supertest';
import express from 'express';
import Redis from 'ioredis';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// mock external dependencies
jest.mock('ioredis');
jest.mock('fs');
jest.mock('path');
jest.mock('sharp');

// initialize the Express app and define the route
const app = express();
app.get('/api/images/:filename', getImage);

describe('GET /api/images/:filename', () => {
    // define path and buffers for test images
    const testPngPath = path.join(__dirname, '..', 'images', 'blindspot.png');

    let testPngBuffer: Buffer;
    let testJpgBuffer: Buffer;

    // initialize buffers with mock image data
    beforeAll(() => {
        testPngBuffer = Buffer.from('test PNG data');
        testJpgBuffer = Buffer.from('test JPG data');
    });

    beforeEach(() => {
        // reset mocks before each test
        jest.resetAllMocks();

        // mock Redis responses
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions' || key === 'mostRequestedImages') {
                return JSON.stringify({});
            }

            if (key.includes('blindspot.png')) {
                return testPngBuffer.toString('base64');
            }

            return null;
        });

        // mock Redis set to return 'OK'
        (Redis.prototype.set as jest.Mock).mockResolvedValue('OK');

        // mock Redis incr to return 1
        (Redis.prototype.incr as jest.Mock).mockResolvedValue(1);

        // mock fs.existsSync to return true
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        // mock fs.readFileSync to return the test image data
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

        // mock sharp to return a mock object
        (fs.readFileSync as jest.Mock).mockImplementation((filePath) => {
            if (filePath.endsWith('.png')) {
                return testPngBuffer;
            }
            return testJpgBuffer;
        });

        // mock sharp methods
        (sharp as unknown as jest.Mock).mockReturnValue({
            resize: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(testPngBuffer)
        });

        // mock path.extname to return the correct extension
        (path.extname as jest.Mock).mockImplementation((filePath) => {
            if (filePath.endsWith('.png')) {
                return '.png';
            }

            return '.jpg';
        });
    });

    it('should return 404 if the image does not exist', async () => {
        // mock fs.existsSync to return false
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        // make a request for a non-existent image
        const res = await request(app).get('/api/images/nonexistent.jpg');

        // expect a 404 response
        expect(res.status).toBe(404);
        expect(res.text).toBe('Image not found!');
    });

    it('should return the cached image if it exists in cache', async () => {
        // mock Redis get to return cached image data
        const cachedImage = testPngBuffer.toString('base64');

        // make a request for a cached image
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions' || key === 'mostRequestedImages') {
                return JSON.stringify({});
            }
            
            if (key === 'blindspot.png') {
                return cachedImage;
            }
            
            return null;
        });

        // make a request for a cached image
        const res = await request(app).get('/api/images/blindspot.png');

        // expect a 200 response with the cached image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
        expect(Buffer.from(res.body).toString()).toEqual(testPngBuffer.toString());
    }, 10000);

    it('should return the resized image and cache it if not in cache', async () => {
        // mock Redis get to return null, indicating a cache miss
        const resizedImage = await sharp(testPngPath).resize(800, 600).toBuffer();
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions' || key === 'mostRequestedImages') {
                return JSON.stringify({});
            }

            return null;
        });

        // make a request for an image with resizing
        const res = await request(app).get('/api/images/blindspot.png?resolution=800x600');

        // expect a 200 response with the resized image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
        expect(Buffer.from(res.body).toString()).toEqual(resizedImage.toString());
    }, 10000);

    it('should return the original image if no resolution is specified and cache it', async () => {
        // mock Redis get to return null which indicates a cache miss
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions' || key === 'mostRequestedImages') {
                return JSON.stringify({});
            }

            return null;
        });

        // make a request for an original image
        const res = await request(app).get('/api/images/blindspot.png');

        // expect a 200 response with the original image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
        expect(Buffer.from(res.body).toString()).toEqual(testPngBuffer.toString());
    }, 10000);

    it('should return the original JPG image if no resolution is specified and cache it', async () => {
        // mock Redis get to return null, indicating a cache miss
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions' || key === 'mostRequestedImages') {
                return JSON.stringify({});
            }

            return null;
        });

        // make a request for an original JPG image
        const res = await request(app).get('/api/images/random.jpg');

        // expect a 200 response with the original JPG image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/jpeg');
        expect(Buffer.from(res.body).toString()).toEqual(testJpgBuffer.toString());
    }, 10000);

    it('should handle case when mostRequestedResolutions is initialized', async () => {
        // mock Redis get to return an initialized value for mostRequestedResolutions
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions') {
                return JSON.stringify({ '800x600': 1 });
            }

            if (key === 'mostRequestedImages') {
                return JSON.stringify({});
            }

            return null;
        });

        // make a request for an image with a specified resolution
        const res = await request(app).get('/api/images/blindspot.png?resolution=800x600');

        // expect a 200 response with the image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
    }, 10000); // Increased timeout

    it('should handle case when mostRequestedImages is initialized', async () => {
        // mock Redis get to return an initialized value for mostRequestedImages
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedImages') {
                return JSON.stringify({ 'blindspot.png': 1 });
            }
            
            if (key === 'mostRequestedResolutions') {
                return JSON.stringify({});
            }
            
            return null;
        });

        // make a request for an image
        const res = await request(app).get('/api/images/blindspot.png');

        // expect a 200 response with the image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
    }, 10000);

    it('should handle case when mostRequestedResolutions is null or empty string', async () => {
        // mock Redis get to return null for mostRequestedResolutions
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions') {
                return null;
            }

            if (key === 'mostRequestedImages') {
                return JSON.stringify({});
            }

            return null;
        });

        // make a request for an image with a specified resolution
        const res = await request(app).get('/api/images/blindspot.png?resolution=800x600');

        // expect a 200 response with the image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
    }, 10000);

    it('should handle case when mostRequestedImages is null or empty string', async () => {
        // mock Redis get to return null for mostRequestedImages
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedImages') {
                return null;
            }

            if (key === 'mostRequestedResolutions') {
                return JSON.stringify({});
            }
            
            return null;
        });

        // make a request for an image
        const res = await request(app).get('/api/images/blindspot.png');

        // expect a 200 response with image data
        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('image/png');
    }, 10000);

    it('should return 500 if there is an error processing the image', async () => {
        // mock fs.readFileSync to throw an error
        (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('Read error'); });
        (Redis.prototype.get as jest.Mock).mockImplementation((key) => {
            if (key === 'mostRequestedResolutions') {
                return JSON.stringify({});
            }

            if (key === 'mostRequestedImages') {
                return JSON.stringify({});
            }
    
            return null;
        });

        // make a request for an image
        const res = await request(app).get('/api/images/blindspot.png');

        // expect a 500 response with error message
        expect(res.status).toBe(500);
        expect(res.text).toBe('Error processing image!');
    });
});
