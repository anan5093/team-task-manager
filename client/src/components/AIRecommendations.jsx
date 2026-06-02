import { useEffect, useState } from 'react';
import { Brain, Loader } from 'lucide-react';
import api from '../api/axios.js';

export default function AIRecommendations({ taskId, onSelect }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!taskId) return;
      setLoading(true);
      try {
        const response = await api.get(`/ai/tasks/${taskId}/recommendations`);
        setRecommendations(response.data);
      } catch (err) {
        console.error('Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [taskId]);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader className="h-4 w-4 animate-spin" />
        Getting AI recommendations...
      </div>
    );

  if (!recommendations) return null;

  return (
    <div className="mt-2 rounded bg-purple-50 p-3">
      <div className="mb-2 flex items-center gap-1">
        <Brain className="h-4 w-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-600">
          AI Recommends
        </span>
      </div>
      <p className="text-xs text-gray-600">
        {recommendations.recommendations}
      </p>
    </div>
  );
}
