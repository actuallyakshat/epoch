import { Router } from 'express';
import { exportData } from '../controllers/exportController';

const router: Router = Router();

router.post('/export', exportData);

export default router;
