import express from 'express';
import { body, param } from 'express-validator';

import { getUsers, updateUserRole } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.patch(
  '/:id/role',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Valid user id is required'),
    body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')
  ],
  validateRequest,
  updateUserRole
);

export default router;
