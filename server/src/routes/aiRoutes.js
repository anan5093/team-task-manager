import express from 'express';
import axios from 'axios';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Contract from '../models/Contract.js';

const router = express.Router();
const SWARM_URL = process.env.SWARM_API_URL || 'http://localhost:8000/api/swarm';

// Helper function to calculate project analytics
async function getProjectAnalytics(projectId) {
  const project = await Project.findById(projectId)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  const tasks = await Task.find({ project: projectId })
    .populate('assignedUser', 'name email')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1 });

  if (!tasks.length) return null;

  const now = new Date();
  const completed = tasks.filter(t => t.status === 'done');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const todo = tasks.filter(t => t.status === 'todo');
  const overdue = tasks.filter(t => t.dueDate < now && t.status !== 'done');
  const dueSoon = tasks.filter(t => {
    const diff = t.dueDate - now;
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000 && t.status !== 'done';
  });

  // User workload analysis
  const userWorkload = {};
  tasks.forEach(t => {
    const userId = t.assignedUser?._id?.toString();
    if (userId) {
      userWorkload[userId] = {
        name: t.assignedUser?.name,
        email: t.assignedUser?.email,
        total: (userWorkload[userId]?.total || 0) + 1,
        completed: (userWorkload[userId]?.completed || 0) + (t.status === 'done' ? 1 : 0),
        inProgress: (userWorkload[userId]?.inProgress || 0) + (t.status === 'in-progress' ? 1 : 0),
        todo: (userWorkload[userId]?.todo || 0) + (t.status === 'todo' ? 1 : 0),
        overdue: (userWorkload[userId]?.overdue || 0) + (overdue.includes(t) ? 1 : 0)
      };
    }
  });

  const avgTasksPerUser = project.members.length > 0 
    ? (tasks.length / project.members.length).toFixed(1)
    : 0;

  const completionRate = tasks.length > 0 
    ? ((completed.length / tasks.length) * 100).toFixed(1)
    : 0;

  const velocity = tasks.filter(t => {
    const createdDate = new Date(t.createdAt);
    const diff = now - createdDate;
    return diff < 7 * 24 * 60 * 60 * 1000; // Last 7 days
  }).length;

  return {
    project: {
      id: project._id,
      name: project.name,
      description: project.description,
      members: project.members.length,
      createdAt: project.createdAt
    },
    tasks: {
      total: tasks.length,
      completed: completed.length,
      inProgress: inProgress.length,
      todo: todo.length,
      overdue: overdue.length,
      dueSoon: dueSoon.length
    },
    metrics: {
      completionRate: parseFloat(completionRate),
      velocity: velocity,
      avgTasksPerUser: parseFloat(avgTasksPerUser),
      healthScore: calculateHealthScore(completed.length, inProgress.length, todo.length, overdue.length)
    },
    userWorkload: Object.values(userWorkload),
    upcomingTasks: dueSoon.slice(0, 5).map(t => ({
      title: t.title,
      dueDate: t.dueDate,
      assignee: t.assignedUser?.name,
      status: t.status
    })),
    overdueTasks: overdue.map(t => ({
      title: t.title,
      dueDate: t.dueDate,
      assignee: t.assignedUser?.name,
      daysOverdue: Math.floor((now - t.dueDate) / (24 * 60 * 60 * 1000))
    })),
    riskFactors: identifyRisks(completed.length, inProgress.length, todo.length, overdue.length, tasks)
  };
}

function calculateHealthScore(completed, inProgress, todo, overdue) {
  const total = completed + inProgress + todo;
  if (total === 0) return 100;
  
  let score = 100;
  score -= (overdue / total) * 30; // Overdue tasks reduce score
  score -= (todo / total) * 20; // Many todos reduce score
  score += (completed / total) * 15; // Completed tasks boost score
  
  return Math.max(0, Math.min(100, score.toFixed(1)));
}

function identifyRisks(completed, inProgress, todo, overdue, tasks) {
  const risks = [];
  const total = completed + inProgress + todo;

  if (overdue > 0) {
    risks.push({
      level: 'critical',
      title: 'Overdue Tasks',
      description: `${overdue} task(s) are overdue. Immediate action required.`
    });
  }

  if (todo > total * 0.5 && inProgress < total * 0.1) {
    risks.push({
      level: 'high',
      title: 'Low Progress',
      description: 'More than 50% tasks are in to-do status with minimal in-progress work.'
    });
  }

  if (completed / total < 0.2 && total > 5) {
    risks.push({
      level: 'medium',
      title: 'Low Completion Rate',
      description: 'Project completion rate is below 20%.'
    });
  }

  // Find stalled tasks (in progress for too long)
  const stalledTasks = tasks.filter(t => {
    const daysSinceUpdate = (new Date() - new Date(t.updatedAt)) / (24 * 60 * 60 * 1000);
    return t.status === 'in-progress' && daysSinceUpdate > 3;
  });

  if (stalledTasks.length > 0) {
    risks.push({
      level: 'medium',
      title: 'Stalled Tasks',
      description: `${stalledTasks.length} task(s) have been in-progress for more than 3 days.`
    });
  }

  return risks;
}

// Get AI insights for a project
router.get(
  '/projects/:projectId/insights',
  protect,
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    try {
      // Get detailed analytics
      const analytics = await getProjectAnalytics(projectId);
      
      if (!analytics) {
        return res.json({
          success: true,
          insights: 'No tasks found in this project yet.',
          analytics: null
        });
      }

      // Create detailed analysis prompt
      const analysisPrompt = `
Analyze this project and provide detailed, actionable insights:

PROJECT: ${analytics.project.name}
DESCRIPTION: ${analytics.project.description || 'No description'}
TEAM SIZE: ${analytics.project.members} members

TASK METRICS:
- Total Tasks: ${analytics.tasks.total}
- Completed: ${analytics.tasks.completed} (${analytics.metrics.completionRate}%)
- In Progress: ${analytics.tasks.inProgress}
- To Do: ${analytics.tasks.todo}
- Overdue: ${analytics.tasks.overdue}
- Due Within 7 Days: ${analytics.tasks.dueSoon}

PROJECT HEALTH SCORE: ${analytics.metrics.healthScore}/100
VELOCITY (Tasks completed last 7 days): ${analytics.metrics.velocity}
AVG TASKS PER MEMBER: ${analytics.metrics.avgTasksPerUser}

TEAM WORKLOAD DISTRIBUTION:
${analytics.userWorkload.map(u => 
  `- ${u.name}: ${u.total} tasks (${u.completed} done, ${u.inProgress} in-progress, ${u.todo} todo, ${u.overdue} overdue)`
).join('\n')}

${analytics.overdueTasks.length > 0 ? `OVERDUE TASKS:
${analytics.overdueTasks.map(t => `- ${t.title} (${t.daysOverdue} days overdue, assigned to ${t.assignee})`).join('\n')}` : ''}

IDENTIFIED RISKS:
${analytics.riskFactors.map(r => `[${r.level.toUpperCase()}] ${r.title}: ${r.description}`).join('\n')}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Insights (3-5 bullet points with specific data)
3. Risk Assessment with severity levels
4. Prioritized Action Items (3-5 specific recommendations with rationale)
5. Team Productivity Analysis
6. Success Metrics to Monitor

Format your response clearly with sections and bullet points.
`;

      const response = await axios.post(
        `${SWARM_URL}/query`,
        {
          query: analysisPrompt,
          project_id: projectId,
          user_id: req.user._id,
          context: 'dashboard-enhanced'
        },
        {
          headers: {
            Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
          }
        }
      );
      
      res.json({
        success: true,
        insights: response.data.analysis || response.data.response,
        analytics: analytics,
        confidence: response.data.confidence,
        executionTrace: response.data.execution_trace
      });
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// Get AI task recommendations
router.get(
  '/tasks/:taskId/recommendations',
  protect,
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    
    try {
      const response = await axios.post(
        `${SWARM_URL}/query`,
        {
          query: `Recommend best assignee for task ${taskId}`,
          project_id: taskId,
          task_id: taskId,
          user_id: req.user._id,
          context: 'task-assignment'
        },
        {
          headers: {
            Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
          }
        }
      );
      
      res.json({
        success: true,
        recommendations: response.data.recommendations || response.data.response,
        confidence: response.data.confidence
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// Get available AI tools for user role
router.get(
  '/tools/available',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const response = await axios.get(
        `${SWARM_URL}/tools/available`,
        {
          params: { user_id: req.user._id, role: req.user.role },
          headers: {
            Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
          }
        }
      );
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// Analyze contract (restricted to admin)
router.post(
  '/contracts/:contractId/analyze',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { contractId } = req.params;
    
    if (req.user.contractAccessLevel === 'none') {
      return res.status(403).json({ error: 'No contract access' });
    }
    
    try {
      const response = await axios.post(
        `${SWARM_URL}/query`,
        {
          query: `Analyze contract ${contractId} for risks and compliance`,
          contract_id: contractId,
          user_id: req.user._id,
          context: 'contract-audit'
        },
        {
          headers: {
            Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
          }
        }
      );
      
      const analysisText = response.data.analysis || response.data.response;
      await Contract.findByIdAndUpdate(contractId, { aiAnalysis: analysisText });

      res.json({
        success: true,
        analysis: analysisText,
        risks: response.data.risks || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

export default router;
