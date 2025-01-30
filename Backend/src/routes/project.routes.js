import { Router } from "express";
import { verifyJWT } from '../middleware/auth.middleware.js';
import { createProject , getAllProjects ,
    getProject , updateProject , deleteProject , addMember
, removeMember , getProjectMembers } from '../controllers/project.controller.js';

const router = Router();

router.route('/create-project').post(verifyJWT, createProject);
router.route('/all-projects').get(verifyJWT, getAllProjects);
router.route('/getproject/:id').get(verifyJWT, getProject);
router.route('/update-project/:id').put(verifyJWT, updateProject);
router.route('/delete-project/:id').delete(verifyJWT, deleteProject);
router.route('/add-member/:id').post(verifyJWT, addMember);
router.route('/remove-member/:id').post(verifyJWT, removeMember);
router.route('/project-members/:id').get(verifyJWT, getProjectMembers);

export default router;