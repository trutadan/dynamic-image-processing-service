import Redis from 'ioredis';
import request from 'supertest';
import express from 'express';
import fs from 'fs';
import { getImage } from '../src/controllers/imageController';
import { validateImageRequest } from '../src/validators/imageValidator';
import { PassThrough } from 'stream';

jest.mock('fs');
jest.mock('sharp');
jest.mock('ioredis');

const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
};
(Redis as unknown as jest.Mock).mockImplementation(() => redisMock);

const app = express();
app.get('/:filename', validateImageRequest, getImage);

describe('GET /:filename', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 404 if image not found', async () => {
    // mock that the image file does not exist
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // send a GET request with a non-existent image filename
    const response = await request(app).get('/nonexistent.jpg');

    // check if the response status code is 404
    expect(response.status).toBe(404);

    // check if the response body is 'Image not found!'
    expect(response.text).toBe('Image not found!');
  });

  it('should return original image if resolution is not specified', async () => {
    // mock that the image file exists
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    // mock that the image file stream is ended
    const mockReadStream = new PassThrough();
    (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);  
    mockReadStream.end();

    // send a GET request with an existing image filename
    const response = await request(app).get('/test.jpg');

    // check if the response status code is 200
    expect(response.status).toBe(200);

    // check if the response content type is image/jpeg
    expect(response.header['content-type']).toBe('image/jpeg');
  });
});
