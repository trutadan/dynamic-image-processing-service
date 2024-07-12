import fs from 'fs';

export const getFilesCount = (dir: string): number => {
    return fs.readdirSync(dir).length;
};
