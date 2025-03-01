import { Router } from 'express';
import { generateMessage } from '../controllers/Ai.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/generate').get(verifyJWT, generateMessage);

export default router;