import express from 'express';
import { body, param } from 'express-validator';

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

const projectValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description is too long'),
  body('members').optional().isArray().withMessage('Members must be an array'),
  body('members.*').optional().isMongoId().withMessage('Every member must be a valid user id')
];

router.use(protect);

router.get('/', getProjects);
router.post('/', authorize('admin'), projectValidation, validateRequest, createProject);
router.get('/:id', param('id').isMongoId().withMessage('Valid project id is required'), validateRequest, getProjectById);
router.put(
  '/:id',
  authorize('admin'),
  param('id').isMongoId().withMessage('Valid project id is required'),
  projectValidation,
  validateRequest,
  updateProject
);
router.delete(
  '/:id',
  authorize('admin'),
  param('id').isMongoId().withMessage('Valid project id is required'),
  validateRequest,
  deleteProject
);

export default router;
