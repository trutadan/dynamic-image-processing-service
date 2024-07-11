import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageRequest:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           description: The name of the image file
 *         resolution:
 *           type: string
 *           description: The desired resolution in {width}x{height} format
 *           pattern: '^\d+x\d+$'
 *       required:
 *         - filename
 */
export const validateImageRequest = [
    // validate 'imageName' parameter
    check('filename')
        .exists().withMessage('Image name is required!')
        .isString().withMessage('Image name must be a string!')
        .isLength({ min: 1 }).withMessage('Image name cannot be empty!')
        .matches(/\.(png|jpg|jpeg)$/).withMessage('Image name must have a valid file extension!'),

    // validate 'resolution' query parameter
    check('resolution')
        .optional()
        .isString().withMessage('Resolution must be a string!')
        .isLength({ min: 1 }).withMessage('Resolution cannot be empty!')
        .matches(/^\d+x\d+$/).withMessage('Resolution must be in the format {width}x{height}!'),

    // send error response if any validation error occurs
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
