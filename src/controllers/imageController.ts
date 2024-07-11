import { Request, Response } from 'express';
import Redis from 'ioredis';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// initialize Redis client
const redis = new Redis({
    host: 'redis',
    port: 6379
});

/**
 * @swagger
 * /api/images/{filename}:
 *   get:
 *     summary: Retrieve an image with optional resizing
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the image file
 *       - in: query
 *         name: resolution
 *         required: false
 *         schema:
 *           type: string
 *           pattern: '^\d+x\d+$'
 *         description: The desired resolution in {width}x{height} format
 *     responses:
 *       200:
 *         description: The requested image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
export const getImage = async (req: Request, res: Response) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '..', '..', 'images', filename);
    if (!fs.existsSync(imagePath)) {
        return res.status(404).send('Image not found!');
    } 

    const resolution = req.query.resolution as string;

    // check if the image is in the cache
    const cachedImage = await redis.get(`${filename}_${resolution}`);
    if (cachedImage) {
        const imageBuffer = Buffer.from(cachedImage, 'base64');

        res.set('Content-Type', 'image/jpeg');
        return res.send(imageBuffer);
    }

    if (resolution) {
        const [width, height] = resolution.split('x').map(Number);

        // read the image file and resize it to the specified resolution
        try {
            const resizedImageBuffer = await sharp(imagePath)
                    .resize(width, height)
                    .toBuffer();

            // set the content type based on the file extension of the image
            const imageExtension = path.extname(filename).toLowerCase();
            const contentType = imageExtension === '.png' ? 'image/png' : 'image/jpeg';

            // Cache the resized image
            await redis.set(`${filename}_${resolution}`, resizedImageBuffer.toString('base64'));

            // send the resized image buffer as the response
            res.set('Content-Type', contentType);
            res.send(resizedImageBuffer);
        } catch (error) {
            return res.status(500).send('Error processing image!');
        }
    } else {
        // if no resolution is specified, send the original image
        const imageStream = fs.createReadStream(imagePath);
        const imageExtension = path.extname(filename).toLowerCase();
        const contentType = imageExtension === '.png' ? 'image/png' : 'image/jpeg';

        // set the content type based on the file extension of the image
        res.set('Content-Type', contentType);
        imageStream.pipe(res);
    }
};
