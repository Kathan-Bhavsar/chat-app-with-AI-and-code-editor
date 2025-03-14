import Router from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { registerUser , loginUser , logoutUser , ping
    ,changePassword
} from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/ping').post(verifyJWT,ping);
router.route('/change-password').post(verifyJWT,changePassword);

export default router;