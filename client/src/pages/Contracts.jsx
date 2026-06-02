import { useState, useEffect } from 'react';
import { Shield, FileText, Plus, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import api from '../api/axios.js';
import { Loading } from '../components/Loading.jsx';
import { Button } from '../components/Button.jsx';
import { Input, Select, Textarea } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Contracts() {
  const { isAdmin } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Contract form state
  const [form, setForm] = useState({
    title: '',
    type: 'legal-contract',
    status: 'confidential',
    content: '',
    contractedUser: ''
  });

  const fetchData = async () => {
    try {
      const [contractsRes, usersRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/users')
      ]);
      setContracts(contractsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createContract = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.content) {
      setError('Title and content are required.');
      return;
    }

    if (form.content.length < 10) {
      setError('Contract content must be at least 10 characters long.');
      return;
    }

    setSaving(true);
    try {
      // Map empty contractedUser to null
      const payload = {
        ...form,
        contractedUser: form.contractedUser || null
      };

      await api.post('/contracts', payload);
      setForm({
        title: '',
        type: 'legal-contract',
        status: 'confidential',
        content: '',
        contractedUser: ''
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create contract.');
    } finally {
      setSaving(false);
    }
  };

  const analyzeContract = async (contractId) => {
    setAnalyzing(contractId);
    setError('');
    try {
      const response = await api.post(`/ai/contracts/${contractId}/analyze`);
      // Update local contracts list with the new analysis
      setContracts(prev => prev.map(c => 
        c._id === contractId ? { ...c, aiAnalysis: response.data.analysis } : c
      ));
      // Expand this analysis view automatically
      setExpandedAnalysis(prev => ({ ...prev, [contractId]: true }));
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Make sure the AI Swarm backend is running.');
    } finally {
      setAnalyzing(null);
    }
  };

  const toggleAnalysis = (contractId) => {
    setExpandedAnalysis(prev => ({
      ...prev,
      [contractId]: !prev[contractId]
    }));
  };

  if (loading) return <Loading label="Loading contracts..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">📄 Contracts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage, track contracted team members, and perform automated AI audits on agreements.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Contract Creation Form (Admin Only) */}
      {isAdmin && (
        <form onSubmit={createContract} className="mb-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 animate-fadeIn">
          <h2 className="mb-4 text-lg font-bold text-ink flex items-center gap-2">
            <Plus className="h-5 w-5 text-brand" /> Add New Contract
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input 
                label="Contract Title" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                placeholder="e.g. Work Agreement with Developer"
              />
            </div>
            <div>
              <Select 
                label="Contract Type" 
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="legal-contract">Legal Contract</option>
                <option value="sec-filing">SEC Filing</option>
                <option value="internal-memo">Internal Memo</option>
              </Select>
            </div>
            <div>
              <Select 
                label="Access Status" 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="confidential">Confidential</option>
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
              </Select>
            </div>
            
            {/* Associated Contracted User Selection */}
            <div className="md:col-span-2">
              <Select
                label="Contracted Team Member (Optional)"
                value={form.contractedUser}
                onChange={(e) => setForm({ ...form, contractedUser: e.target.value })}
              >
                <option value="">None / External Contractor</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </Select>
            </div>
            
            <div className="md:col-span-4">
              <Textarea 
                label="Contract Content" 
                value={form.content} 
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Paste the full text of the agreement here (min 10 characters)..."
                rows={5}
              />
            </div>
          </div>
          <Button type="submit" className="mt-4" disabled={saving}>
            {saving ? 'Saving...' : 'Add Contract'}
          </Button>
        </form>
      )}

      {/* Contracts Listing */}
      {contracts.length === 0 ? (
        <p className="text-sm text-slate-500">No contracts found. Admins can add contracts using the form above.</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract._id}
              className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4 transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2.5 mt-1">
                    <FileText className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-ink">{contract.title}</h3>
                      {contract.contractedUser && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-brand ring-1 ring-inset ring-teal-600/10">
                          <UserCheck className="h-3 w-3" /> Bound to: {contract.contractedUser.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Type: <span className="font-semibold">{contract.type}</span> · Status: <span className="font-semibold">{contract.status}</span> · Uploaded by: <span className="font-semibold">{contract.uploadedBy?.name || 'System'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {contract.aiAnalysis && (
                    <Button
                      variant="secondary"
                      onClick={() => toggleAnalysis(contract._id)}
                      size="sm"
                    >
                      {expandedAnalysis[contract._id] ? 'Hide Report' : 'Show Report'}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      variant="primary"
                      onClick={() => analyzeContract(contract._id)}
                      disabled={analyzing === contract._id}
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      {analyzing === contract._id ? (
                        <>Auditing...</>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {contract.aiAnalysis ? 'Re-Audit' : '🤖 AI Audit'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Display full content in a clean summary text block */}
              <div className="bg-slate-50 rounded p-4 text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto border border-slate-100">
                {contract.content}
              </div>

              {/* AI Analysis Result Rendering */}
              {contract.aiAnalysis && expandedAnalysis[contract._id] && (
                <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50/70 p-5 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 border-b border-purple-200 pb-2 text-purple-900 font-bold text-sm">
                    <Shield className="h-5 w-5 text-purple-700" />
                    AI Compliance & Audit Report
                  </div>
                  <div className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                    {contract.aiAnalysis}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
