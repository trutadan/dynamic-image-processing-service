import Redis from 'ioredis';
import express from 'express';
import imageRoutes from './routes/imageRoutes';
import statisticsRoutes from './routes/statisticsRoutes';

const app = express();
const port = 3000;

// setup Swagger
const setupSwagger = require('../swagger');
setupSwagger(app);

// initialize Redis client
const redis = new Redis({
  host: 'redis',
  port: 6379
});

// initialize statistics
const initializeStatistics = async () => {
  const statistics = ['resizedImages', 'cacheHits', 'cacheMisses', 'totalRequests', 'totalErrors', 'averageProcessingTime'];
  for (const statistic of statistics) {
      const value = await redis.get(statistic);
      if (value === null) {
          await redis.set(statistic, 0);
      }
  }

  // initialize mostRequestedResolutions dictionary
  if (await redis.get('mostRequestedResolutions') === null) {
      await redis.set('mostRequestedResolutions', JSON.stringify({}));
  }

  // initialize mostRequestedImages dictionary
  if (await redis.get('mostRequestedImages') === null) {
      await redis.set('mostRequestedImages', JSON.stringify({}));
  }
};

initializeStatistics();

app.use('/api/images', imageRoutes);
app.use('/api', statisticsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}...`);
});
