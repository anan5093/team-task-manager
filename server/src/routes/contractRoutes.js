import express from 'express';
import { body, param } from 'express-validator';
import {
  getContracts,
  createContract,
  analyzeContract
} from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect);

router.get('/', getContracts);

router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().isLength({ min: 3 }),
    body('type').isIn(['sec-filing', 'internal-memo', 'legal-contract']),
    body('status').isIn(['public', 'confidential', 'restricted']),
    body('content').trim().isLength({ min: 10 }),
    body('contractedUser').optional({ checkFalsy: true }).isMongoId()
  ],
  validateRequest,
  createContract
);

router.get('/:id/analyze', param('id').isMongoId(), analyzeContract);

export default router;
