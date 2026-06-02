import { useEffect, useState } from 'react';
import { Zap, AlertCircle, TrendingUp, Users, CheckCircle, Clock, AlertTriangle, Zap as LightningIcon } from 'lucide-react';
import api from '../api/axios.js';
import { Loading } from './Loading.jsx';

const RiskBadge = ({ level }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  };
  
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${colors[level] || colors.low}`}>
      {level?.toUpperCase()}
    </span>
  );
};

const MetricCard = ({ icon: Icon, label, value, unit = '', subtext = '' }) => (
  <div className="rounded-lg bg-white p-3 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {value}<span className="text-sm text-gray-600">{unit}</span>
        </p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
    </div>
  </div>
);

const HealthScore = ({ score }) => {
  let color = 'text-green-600';
  let bgColor = 'bg-green-50';
  let status = '🟢 Healthy';
  
  if (score < 50) {
    color = 'text-red-600';
    bgColor = 'bg-red-50';
    status = '🔴 Critical';
  } else if (score < 75) {
    color = 'text-orange-600';
    bgColor = 'bg-orange-50';
    status = '🟡 At Risk';
  }
  
  return (
    <div className={`rounded-lg ${bgColor} p-4 border border-gray-200`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Project Health</h4>
        <span className={`${color} text-sm font-bold`}>{status}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className={`text-4xl font-bold ${color}`}>{score}</span>
          <span className="text-sm text-gray-600">/100</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${color.replace('text-', 'bg-')}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function AIInsights({ projectId, context = 'dashboard' }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('overview');

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/ai/projects/${projectId}/insights`);
      setInsights(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchInsights();
    }
  }, [projectId]);

  if (!projectId) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LightningIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">AI Project Insights</h3>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && <Loading />}
      
      {error && (
        <div className="flex gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {insights?.analytics && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <HealthScore score={insights.analytics.metrics.healthScore} />
            <MetricCard
              icon={CheckCircle}
              label="Completion Rate"
              value={insights.analytics.metrics.completionRate}
              unit="%"
              subtext={`${insights.analytics.tasks.completed}/${insights.analytics.tasks.total} tasks`}
            />
            <MetricCard
              icon={TrendingUp}
              label="Velocity"
              value={insights.analytics.metrics.velocity}
              subtext="tasks (7 days)"
            />
            <MetricCard
              icon={Users}
              label="Avg per Member"
              value={insights.analytics.metrics.avgTasksPerUser}
              subtext={`${insights.analytics.project.members} team members`}
            />
          </div>

          {/* Task Distribution */}
          <div className="rounded-lg bg-white p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Task Status Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { label: 'Total', value: insights.analytics.tasks.total, color: 'bg-blue-100 text-blue-700' },
                { label: 'Done', value: insights.analytics.tasks.completed, color: 'bg-green-100 text-green-700' },
                { label: 'In Progress', value: insights.analytics.tasks.inProgress, color: 'bg-purple-100 text-purple-700' },
                { label: 'To Do', value: insights.analytics.tasks.todo, color: 'bg-gray-100 text-gray-700' },
                { label: 'Overdue', value: insights.analytics.tasks.overdue, color: 'bg-red-100 text-red-700' }
              ].map((stat, idx) => (
                <div key={idx} className={`rounded-lg p-3 ${stat.color}`}>
                  <p className="text-xs font-medium opacity-75">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          {insights.analytics.riskFactors?.length > 0 && (
            <div className="rounded-lg bg-white p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Risk Assessment
              </h4>
              <div className="space-y-2">
                {insights.analytics.riskFactors.map((risk, idx) => (
                  <div key={idx} className="flex gap-3 p-2 rounded-lg bg-gray-50">
                    <RiskBadge level={risk.level} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{risk.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Tasks */}
          {insights.analytics.overdueTasks?.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3">🔴 Overdue Tasks ({insights.analytics.overdueTasks.length})</h4>
              <div className="space-y-2">
                {insights.analytics.overdueTasks.map((task, idx) => (
                  <div key={idx} className="text-sm text-red-800 p-2 bg-white rounded border border-red-100">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {task.daysOverdue} days overdue • Assigned to {task.assignee || 'Unassigned'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Workload */}
          {insights.analytics.userWorkload?.length > 0 && (
            <div className="rounded-lg bg-white p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Team Workload Distribution</h4>
              <div className="space-y-2">
                {insights.analytics.userWorkload.map((user, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-gray-900">{user.name}</p>
                      <span className="text-xs font-semibold text-gray-600">{user.total} tasks</span>
                    </div>
                    <div className="flex gap-1">
                      {[
                        { count: user.completed, label: 'Done', color: 'bg-green-500' },
                        { count: user.inProgress, label: 'In Progress', color: 'bg-blue-500' },
                        { count: user.todo, label: 'To Do', color: 'bg-gray-400' },
                        { count: user.overdue, label: 'Overdue', color: 'bg-red-500' }
                      ].map((status, sidx) => (
                        <div key={sidx} className="flex-1">
                          <div className={`${status.color} rounded h-6 flex items-center justify-center`}>
                            <span className="text-xs font-bold text-white">{status.count}</span>
                          </div>
                          <p className="text-xs text-center text-gray-600 mt-0.5">{status.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Text */}
          {insights.insights && (
            <div className="rounded-lg bg-white p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Detailed Analysis</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {insights.insights}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-xs text-gray-500">
                  Confidence: {(insights.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500">
                  Steps: {insights.executionTrace?.length || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
