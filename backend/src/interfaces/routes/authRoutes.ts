import { Router } from 'express';
import { registerController, loginController, getUsernameController } from '../controllers/authController';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/username/:userId', getUsernameController);

export default router;
