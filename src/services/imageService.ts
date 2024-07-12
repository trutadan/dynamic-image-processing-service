import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const getImagePath = (filename: string): string => {
    return path.join(__dirname, '..', '..', 'images', filename);
};

export const imageExists = (imagePath: string): boolean => {
    return fs.existsSync(imagePath);
};

export const readImage = (imagePath: string): Buffer => {
    return fs.readFileSync(imagePath);
};

export const resizeImage = async (imagePath: string, width: number, height: number): Promise<Buffer> => {
    return await sharp(imagePath).resize(width, height).toBuffer();
};
