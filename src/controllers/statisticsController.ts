import { Request, Response } from 'express';
import { getStatisticsData, getTopN } from '../services/statisticsService';
import { getFilesCount } from '../services/fileService';
import { getCacheSize } from '../services/cacheService';
import path from 'path';

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get statistics of the image processing service
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalImages:
 *                   type: integer
 *                   description: The total number of images
 *                   example: 100
 *                 resizedImages:
 *                   type: integer
 *                   description: The count of images that have been resized
 *                   example: 50
 *                 cacheHits:
 *                   type: integer
 *                   description: The number of cache hits
 *                   example: 200
 *                 cacheMisses:
 *                   type: integer
 *                   description: The number of cache misses
 *                   example: 100
 *                 totalRequests:
 *                   type: integer
 *                   description: The total number of requests
 *                   example: 300
 *                 totalErrors:
 *                   type: integer
 *                   description: The total number of errors
 *                   example: 10
 *                 averageProcessingTime:
 *                   type: string
 *                   description: The average processing time in milliseconds
 *                   example: "150.00 ms"
 *                 mostRequestedResolutions:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: The most requested image resolutions
 *                 mostRequestedImages:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: The most requested images
 *                 cacheSize:
 *                   type: integer
 *                   description: The size of the cache
 *                   example: 500
 *                 cacheHitMissRatio:
 *                   type: string
 *                   description: The ratio of cache hits to misses
 *                   example: "2.00"
 *                 requestSuccessErrorRatio:
 *                   type: string
 *                   description: The ratio of successful requests to errors
 *                   example: "29.00"
 *       500:
 *         description: Error retrieving statistics
 */
export const getStatistics = async (_: Request, res: Response) => {
    try {
        const totalImages = getFilesCount(path.join(__dirname, '..', '..', 'images'));
        const {
            resizedImages,
            cacheHits,
            cacheMisses,
            totalRequests,
            totalErrors,
            averageProcessingTime,
            mostRequestedResolutions,
            mostRequestedImages
        } = await getStatisticsData();

        const topResolutions = getTopN(mostRequestedResolutions, 3);
        const topImages = getTopN(mostRequestedImages, 3);

        // get the cache size
        const cacheSize = await getCacheSize();

        // calculate ratios
        const cacheHitMissRatio = cacheMisses == 0 ? 'N/A' : (Number(cacheHits) / Number(cacheMisses)).toFixed(2);
        const requestSuccessErrorRatio = totalErrors == 0 ? 'N/A' : ((Number(totalRequests) - Number(totalErrors)) / Number(totalErrors)).toFixed(2);

        res.json({
            totalImages: Number(totalImages),
            resizedImages: Number(resizedImages),
            cacheHits: Number(cacheHits),
            cacheMisses: Number(cacheMisses),
            totalRequests: Number(totalRequests),
            totalErrors: Number(totalErrors),
            averageProcessingTime,
            mostRequestedResolutions: topResolutions,
            mostRequestedImages: topImages,
            cacheSize,
            cacheHitMissRatio,
            requestSuccessErrorRatio
        });
    } catch (error) {
        res.status(500).send('Error retrieving statistics!');
    }
};
