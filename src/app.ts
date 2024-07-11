import express from 'express';
import imageRoutes from './routes/imageRoutes';

const app = express();
const port = 3000;

const setupSwagger = require('../swagger');
setupSwagger(app);

app.use('/api/images', imageRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}...`);
});
