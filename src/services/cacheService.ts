import Redis from 'ioredis';

const redis = new Redis({
    host: 'redis',
    port: 6379
});

export const incrementCacheStatistic = async (key: string): Promise<void> => {
    // increment the specified cache statistic
    await redis.incr(key);
};

export const updateAverageProcessingTime = async (time: number): Promise<void> => {
    // calculate the new average processing time
    const totalRequests = await redis.get('totalRequests') || 0;
    const averageProcessingTime = await redis.get('averageProcessingTime') || 0;
    const newAverage = ((Number(averageProcessingTime) * Number(totalRequests)) + time) / (Number(totalRequests) + 1);
    await redis.set('averageProcessingTime', newAverage);
};

export const getCache = async (key: string): Promise<string | null> => {
    return await redis.get(key);
};

export const setCache = async (key: string, value: string): Promise<void> => {
    await redis.set(key, value);
};

export const getCacheSize = async (): Promise<number> => {
    return await redis.dbsize();
};
