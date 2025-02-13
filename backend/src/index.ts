import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { connectToDatabase } from '@infrastructure/config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors());

// Swagger configuration
const swaggerPath = path.join(__dirname, 'swagger', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test route
app.get('/', (req, res) => {
  res.send('Backend OK');
});

// Start server
(async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();
