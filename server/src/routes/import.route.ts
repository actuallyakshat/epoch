import { Router } from 'express';
import { importData } from '../controllers/importController';

const router: Router = Router();

router.post('/import', importData);

export default router;
