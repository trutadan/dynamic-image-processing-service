import request from 'supertest';
import express, { Request, Response } from 'express';
import { validateImageRequest } from '../src/validators/imageValidator';

const app = express();
app.get('/:filename', validateImageRequest, (_: Request, res: Response) => res.send('OK'));

describe('validateImageRequest', () => {
  it('should return 404 if filename is not provided', async () => {
    // send a GET request with empty filename
    const response = await request(app).get('/');

    // check if the response status code is 404
    expect(response.status).toBe(404);
  });

  it('should return 400 if filename has an invalid extension', async () => {
    // send a GET request with an invalid file extension
    const response = await request(app).get('/invalid.txt');

    // check if the response status code is 400
    expect(response.status).toBe(400);

    // check if the response body contains the correct error message
    expect(response.body.errors[0].msg).toBe('Image name must have a valid file extension!');
  });

  it('should return 400 if resolution is not in the correct format', async () => {
    // send a GET request with the filename test.jpg and resolution 100
    const response = await request(app).get('/test.jpg?resolution=100');

    // check if the response status code is 400
    expect(response.status).toBe(400);

    // check if the response body contains the correct error message
    expect(response.body.errors[0].msg).toBe('Resolution must be in the format {width}x{height}!');
  });

  it('should pass validation if correct parameters are provided', async () => {
    // send a GET request with the filename test.jpg and resolution 100x100
    const response = await request(app).get('/test.jpg?resolution=100x100');

    // check if the response status code is 200
    expect(response.status).toBe(200);

    // check if the response body is 'OK'
    expect(response.text).toBe('OK');
  });
});
