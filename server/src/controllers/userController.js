import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('name email role createdAt').sort({ name: 1 });
  res.json(users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.role = req.body.role;
  await user.save();

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});
