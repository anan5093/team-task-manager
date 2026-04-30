import express from 'express';
import { body, param, query } from 'express-validator';

import {
  createTask,
  deleteTask,
  getDashboardStats,
  getTasks,
  updateTask
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

const emptyQueryToUndefined = (value) => {
  if (typeof value !== 'string') return value;

  const normalizedValue = value.trim();
  return normalizedValue === '' ? undefined : normalizedValue;
};

const filterValidation = [
  query('project')
    .customSanitizer(emptyQueryToUndefined)
    .optional()
    .isMongoId()
    .withMessage('Project filter must be a valid id'),
  query('user')
    .customSanitizer(emptyQueryToUndefined)
    .optional()
    .isMongoId()
    .withMessage('User filter must be a valid id'),
  query('status')
    .customSanitizer(emptyQueryToUndefined)
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Invalid status')
];

const taskValidation = [
  body('title').trim().isLength({ min: 2 }).withMessage('Task title must be at least 2 characters'),
  body('description').optional().trim().isLength({ max: 1500 }).withMessage('Description is too long'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('project').isMongoId().withMessage('Valid project id is required'),
  body('assignedUser').isMongoId().withMessage('Valid assigned user id is required')
];

router.use(protect);

router.get('/', filterValidation, validateRequest, getTasks);
router.get('/stats', filterValidation, validateRequest, getDashboardStats);
router.post('/', authorize('admin'), taskValidation, validateRequest, createTask);
router.put(
  '/:id',
  param('id').isMongoId().withMessage('Valid task id is required'),
  [
    body('title').optional().trim().isLength({ min: 2 }).withMessage('Task title must be at least 2 characters'),
    body('description').optional().trim().isLength({ max: 1500 }).withMessage('Description is too long'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
    body('project').optional().isMongoId().withMessage('Valid project id is required'),
    body('assignedUser').optional().isMongoId().withMessage('Valid assigned user id is required')
  ],
  validateRequest,
  updateTask
);
router.delete(
  '/:id',
  authorize('admin'),
  param('id').isMongoId().withMessage('Valid task id is required'),
  validateRequest,
  deleteTask
);

export default router;
