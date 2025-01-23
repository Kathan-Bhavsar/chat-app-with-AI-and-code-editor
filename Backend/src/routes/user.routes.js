import Router from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { registerUser , loginUser , logoutUser ,refreshAccessToken 
    ,changePassword
} from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-Token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT,changePassword);

export default router;