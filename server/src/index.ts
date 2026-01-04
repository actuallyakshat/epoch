import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { setupRedis } from './config/redis';
import { loadEnv, config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';
import routes from './routes';

loadEnv();

const app = express();
const PORT = config.port;

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { error: 'Too many requests from this IP' },
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https://validator.swagger.io'],
        'script-src': ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: config.maxDataSize }));
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.json({
    message: 'Epoch Share Server',
    version: '1.0.0',
    docs: '/api-docs',
    openapi: '/api-docs.json',
  });
});

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

app.use(errorHandler);

async function start() {
  try {
    await setupRedis();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
