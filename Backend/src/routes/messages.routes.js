import { Router } from "express";
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getMessagesByProjectId } from '../controllers/message.controller.js';

const router = Router();

router.route('/get-messages/:projectId').get(verifyJWT, getMessagesByProjectId);

export default router;