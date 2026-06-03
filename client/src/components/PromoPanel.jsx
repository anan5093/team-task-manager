import { Shield, Cpu, Brain, Database, ArrowUpRight } from 'lucide-react';

export const PromoPanel = () => {
  return (
    <section className="flex flex-col justify-center items-center lg:items-start w-full flex-none lg:flex-1 p-6 sm:p-10 lg:p-12 bg-slate-950/20">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-400 bg-teal-400/10 rounded-full border border-teal-500/20 mb-3 animate-pulse">
            ✨ AI Swarm Orchestrator v2.0
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Team Task Manager
          </h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            Keep projects, ownership, due dates, and AI-driven insights visible across the team with multi-agent orchestration.
          </p>
        </div>

        {/* Bento-style Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Core Platform */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20 mb-4 group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-white text-base flex items-center gap-1">
                Core Platform
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Role-based workspace control, Kanban task boards, secure JWT auth, and unified MongoDB database.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">RBAC</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">Kanban</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">MongoDB</span>
            </div>
          </div>

          {/* Card 2: AI Swarm Orchestration */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mb-4 group-hover:scale-110 transition-transform">
                <Cpu size={20} />
              </div>
              <h3 className="font-bold text-white text-base">
                Swarm Engine
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                LangGraph state machine coordinating specialized agents via FastAPI microservices.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">LangGraph</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">FastAPI</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">Agents</span>
            </div>
          </div>

          {/* Card 3: MCP Agent Tools */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 mb-4 group-hover:scale-110 transition-transform">
                <Brain size={20} />
              </div>
              <h3 className="font-bold text-white text-base">
                Intelligent Insights
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Task assignee matching, project health auditing, and contract risk/compliance checking.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">Auditor</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">Contracts</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">Matchmaker</span>
            </div>
          </div>

          {/* Card 4: Architecture Topology */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group cursor-default">
            <div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 mb-4 group-hover:scale-110 transition-transform">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-white text-base">
                Service Topology
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Vite Client (Port 5173) connects to Express (Port 5000) and LangGraph Swarm (Port 8000).
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">Ollama</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">OpenRouter</span>
              <span className="text-[10px] bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded border border-white/5">CORS OK</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PromoPanel;
