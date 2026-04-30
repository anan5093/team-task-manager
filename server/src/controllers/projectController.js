import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateMembers = [
  { path: 'members', select: 'name email role' },
  { path: 'createdBy', select: 'name email' }
];

export const getProjects = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'admin'
      ? {}
      : { members: req.user._id };

  const projects = await Project.find(query).populate(populateMembers).sort({ createdAt: -1 });
  res.json(projects);
});

export const createProject = asyncHandler(async (req, res) => {
  const memberIds = [...new Set([...(req.body.members || []), req.user._id.toString()])];
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description,
    members: memberIds,
    createdBy: req.user._id
  });

  const populated = await project.populate(populateMembers);
  res.status(201).json(populated);
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(populateMembers);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role !== 'admin' && !project.members.some((member) => member._id.equals(req.user._id))) {
    const error = new Error('You do not have access to this project');
    error.statusCode = 403;
    throw error;
  }

  res.json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  project.name = req.body.name ?? project.name;
  project.description = req.body.description ?? project.description;
  project.members = req.body.members ?? project.members;
  await project.save();

  const populated = await project.populate(populateMembers);
  res.json(populated);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: 'Project and related tasks deleted' });
});
