import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateDto } from '../middleware/validation';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

const router = Router();
const controller = new TaskController();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', authorize('admin', 'manager'), validateDto(CreateTaskDto), controller.create);
// Task-level permissions (owner/role based) are enforced inside the controller
router.put('/:id', validateDto(UpdateTaskDto), controller.update);
router.delete('/:id', controller.remove);

export default router;

