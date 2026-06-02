import Contract from '../models/Contract.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateFields = [
  { path: 'uploadedBy', select: 'name email' },
  { path: 'contractedUser', select: 'name email role' }
];

export const getContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find()
    .populate(populateFields)
    .sort({ createdAt: -1 });
  
  res.json(contracts);
});

export const createContract = asyncHandler(async (req, res) => {
  const contract = await Contract.create({
    title: req.body.title,
    type: req.body.type,
    status: req.body.status,
    content: req.body.content,
    uploadedBy: req.user._id,
    contractedUser: req.body.contractedUser || null
  });

  const populated = await contract.populate(populateFields);
  res.status(201).json(populated);
});

export const analyzeContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  
  if (!contract) {
    const error = new Error('Contract not found');
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === 'member' && contract.status !== 'public') {
    const error = new Error('You cannot access this contract');
    error.statusCode = 403;
    throw error;
  }

  res.json({
    contract,
    analysisAvailable: true
  });
});
