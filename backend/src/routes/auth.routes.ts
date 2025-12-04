import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', validateDto(RegisterDto), controller.register);
router.post('/login', validateDto(LoginDto), controller.login);

export default router;

