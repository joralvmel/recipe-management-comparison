import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'node:path';
import { connectToDatabase } from '@infrastructure/config/database';
import { errorHandler } from '@shared/middlewares/errorHandler';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { loggerMiddleware } from '@shared/middlewares/loggerMiddleware';
import authRoutes from '@interfaces/routes/authRoutes';
import recipeRoutes from '@interfaces/routes/recipeRoutes';
import favoriteRoutes from '@interfaces/routes/favoriteRoutes';
import reviewRoutes from '@interfaces/routes/reviewRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(loggerMiddleware);

// Swagger configuration
const swaggerPath = path.join(__dirname, 'swagger', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/reviews', reviewRoutes);

// Protected route test
app.get('/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

// Default route
app.get('/', (req, res) => {
  res.send('Backend OK');
});

app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })();
}

export default app;
