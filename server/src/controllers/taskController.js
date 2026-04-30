import mongoose from 'mongoose';

import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const taskPopulate = [
  { path: 'project', select: 'name' },
  { path: 'assignedUser', select: 'name email role' },
  { path: 'createdBy', select: 'name email' }
];

const buildTaskQuery = (req) => {
  const query = {};
  if (req.query.project) query.project = req.query.project;
  if (req.query.user) query.assignedUser = req.query.user;
  if (req.query.status) query.status = req.query.status;
  if (req.user.role !== 'admin') query.assignedUser = req.user._id;
  return query;
};

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req)).populate(taskPopulate).sort({ dueDate: 1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.project);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const assignedUserId = new mongoose.Types.ObjectId(req.body.assignedUser);
  const isProjectMember = project.members.some((memberId) => memberId.equals(assignedUserId));

  if (!isProjectMember) {
    const error = new Error('Assigned user must be a project member');
    error.statusCode = 422;
    throw error;
  }

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'todo',
    dueDate: req.body.dueDate,
    project: project._id,
    assignedUser: assignedUserId,
    createdBy: req.user._id
  });

  const populated = await task.populate(taskPopulate);
  res.status(201).json(populated);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role !== 'admin' && !task.assignedUser.equals(req.user._id)) {
    const error = new Error('You can only update tasks assigned to you');
    error.statusCode = 403;
    throw error;
  }

  task.title = req.body.title ?? task.title;
  task.description = req.body.description ?? task.description;
  task.status = req.body.status ?? task.status;
  task.dueDate = req.body.dueDate ?? task.dueDate;

  if (req.user.role === 'admin') {
    task.assignedUser = req.body.assignedUser ?? task.assignedUser;
    task.project = req.body.project ?? task.project;
  }

  await task.save();
  const populated = await task.populate(taskPopulate);
  res.json(populated);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const query = buildTaskQuery(req);
  const now = new Date();

  const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
    Task.countDocuments(query),
    Task.countDocuments({ ...query, status: 'done' }),
    Task.countDocuments({ ...query, status: { $ne: 'done' }, dueDate: { $lt: now } })
  ]);

  res.json({ totalTasks, completedTasks, overdueTasks });
});
