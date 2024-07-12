import { getCache, setCache } from './cacheService';

export const updateMostRequestedResolutions = async (resolution: string): Promise<void> => {
    // increment the count of the requested resolution
    const data = JSON.parse(await getCache('mostRequestedResolutions') || '{}');
    data[resolution] = data[resolution] ? data[resolution] + 1 : 1;
    await setCache('mostRequestedResolutions', JSON.stringify(data));
};

export const updateMostRequestedImages = async (filename: string): Promise<void> => {
    // increment the count of the requested image
    const data = JSON.parse(await getCache('mostRequestedImages') || '{}');
    data[filename] = data[filename] ? data[filename] + 1 : 1;
    await setCache('mostRequestedImages', JSON.stringify(data));
};

export const getStatisticsData = async (): Promise<any> => {
    const resizedImages = await getCache('resizedImages') || 0;
    const cacheHits = await getCache('cacheHits') || 0;
    const cacheMisses = await getCache('cacheMisses') || 0;
    const totalRequests = await getCache('totalRequests') || 0;
    const totalErrors = await getCache('totalErrors') || 0;

    // get the average processing time in milliseconds
    let averageProcessingTime = await getCache('averageProcessingTime') || 0;
    averageProcessingTime = Number(averageProcessingTime).toFixed(2) + ' ms';

    // get the most requested resolutions and images
    const mostRequestedResolutions = JSON.parse(await getCache('mostRequestedResolutions') || '{}');
    const mostRequestedImages = JSON.parse(await getCache('mostRequestedImages') || '{}');

    return {
        resizedImages,
        cacheHits,
        cacheMisses,
        totalRequests,
        totalErrors,
        averageProcessingTime,
        mostRequestedResolutions,
        mostRequestedImages
    };
};

export const getTopN = (obj: { [key: string]: number }, n: number): { [key: string]: number } => {
    // sort the object by value in descending order
    const sortedEntries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    // return the top n entries
    return Object.fromEntries(sortedEntries.slice(0, n));
};
