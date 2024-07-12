import { Request, Response } from 'express';
import { performance } from 'perf_hooks';
import { getImagePath, imageExists, readImage, resizeImage } from '../services/imageService';
import { getCache, setCache, incrementCacheStatistic } from '../services/cacheService';
import { updateMostRequestedResolutions, updateMostRequestedImages } from '../services/statisticsService';
import { updateAverageProcessingTime } from '../services/cacheService';
import path from 'path';

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
    // get the filename parameter from the request
    const { filename } = req.params;
    
    const imagePath = getImagePath(filename);
    if (!imageExists(imagePath)) {
        // increment the cache misses counter and total errors counter
        await incrementCacheStatistic('totalErrors');
        await incrementCacheStatistic('cacheMisses');

        // return 404 if the image file does not exist
        return res.status(404).send('Image not found!');
    }

    // get the resolution query parameter from the request
    const resolution = req.query.resolution as string;
    const cacheKey = resolution ? `${filename}_${resolution}` : filename;
    
    // set the content type based on the file extension of the image
    const imageExtension = path.extname(filename).toLowerCase();
    const contentType = imageExtension === '.png' ? 'image/png' : 'image/jpeg';

    // check if the image is in the cache
    const cachedImage = await getCache(cacheKey);
    if (cachedImage) {
        const imageBuffer = Buffer.from(cachedImage, 'base64');

        // increment the cache hits counter and total requests counter
        await incrementCacheStatistic('cacheHits');
        await incrementCacheStatistic('totalRequests');

        // update the most requested resolutions and images statistics
        await updateMostRequestedResolutions(resolution || 'original');
        await updateMostRequestedImages(filename);

        // send the cached image buffer as the response
        res.set('Content-Type', contentType);
        return res.send(imageBuffer);
    }

    try {
        const startTime = performance.now();
        let imageBuffer;
        if (resolution) {
            // read the image file and resize it to the specified resolution
            const [width, height] = resolution.split('x').map(Number);

            // use sharp to resize the image
            imageBuffer = await resizeImage(imagePath, width, height);

            // increment the resized images counter
            await incrementCacheStatistic('resizedImages');

            // update the most requested resolutions statistic
            await updateMostRequestedResolutions(resolution);
        } else {
            // read the image file
            imageBuffer = readImage(imagePath);
        }
        
        // cache the resized image
        await setCache(cacheKey, imageBuffer.toString('base64'));
        await incrementCacheStatistic('cacheMisses');

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // update the average processing time statistic
        await updateAverageProcessingTime(processingTime);

        // update the most requested images statistic
        await updateMostRequestedImages(filename);

        // increment the total requests counter
        await incrementCacheStatistic('totalRequests');

        // send the resized image buffer as the response
        res.set('Content-Type', contentType);
        return res.send(imageBuffer);
    } catch (error) {
        // increment the total errors counter
        await incrementCacheStatistic('totalErrors');
        return res.status(500).send('Error processing image!');
    }
};
