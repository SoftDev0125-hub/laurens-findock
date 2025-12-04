import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const controller = new UserController();

router.use(authenticate);
router.get('/', controller.list);

export default router;

