import express from 'express';
import { register, login, getMe, updateMe, getAllUsers } from '../controllers/authController';

import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);
router.get('/users', authenticateToken, getAllUsers);

export default router;
