import { Router } from 'express';
import healthRoutes from './health.route';
import exportRoutes from './export.route';
import importRoutes from './import.route';

const router: Router = Router();

router.use('/', healthRoutes);
router.use('/data', exportRoutes);
router.use('/data', importRoutes);

export default router;
