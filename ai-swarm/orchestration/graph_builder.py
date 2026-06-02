from langgraph.graph import StateGraph, END
from orchestration.state import AgentState
from mcp_servers.task_retriever import task_retriever
from mcp_servers.project_auditor import project_auditor
from mcp_servers.report_synthesizer import report_synthesizer
from config import settings
from agents import query_llm
from datetime import datetime
import json

class MultiAgentOrchestrator:
    def __init__(self):
        self.model = settings.MODEL
        self.graph = self._build_graph()
    
    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("retrieve_data", self._node_retrieve_data)
        workflow.add_node("analyze", self._node_analyze)
        workflow.add_node("synthesize", self._node_synthesize)
        workflow.add_node("finalize", self._node_finalize)
        
        # Add edges
        workflow.add_edge("retrieve_data", "analyze")
        workflow.add_edge("analyze", "synthesize")
        workflow.add_edge("synthesize", "finalize")
        workflow.add_edge("finalize", END)
        
        workflow.set_entry_point("retrieve_data")
        return workflow.compile()
    
    async def _node_retrieve_data(self, state: AgentState):
        """Node 1: Retrieve data from MCP servers"""
        state['steps_executed'] = state.get('steps_executed', [])
        state['errors'] = state.get('errors', [])
        
        try:
            jwt_token = state['jwt_token']
            
            if state.get('context') in ['dashboard', 'dashboard-enhanced']:
                project_id = state.get('project_id')
                workload = await task_retriever.call_tool(
                    'get_user_workload',
                    user_id=state['user_id'],
                    jwt_token=jwt_token
                )
                health = await project_auditor.call_tool(
                    'audit_project_health',
                    project_id=project_id,
                    jwt_token=jwt_token
                )
                risks = await project_auditor.call_tool(
                    'detect_team_risks',
                    project_id=project_id,
                    jwt_token=jwt_token
                )
                overdue = await task_retriever.call_tool(
                    'get_overdue_tasks',
                    project_id=project_id,
                    jwt_token=jwt_token
                )
                state['retrieved_data'] = {
                    'workload': workload,
                    'health': health,
                    'risks': risks,
                    'overdue': overdue
                }
            
            elif state.get('context') == 'task-assignment':
                project_id = state.get('project_id')
                tasks = await task_retriever.call_tool(
                    'get_tasks_by_project',
                    project_id=project_id,
                    jwt_token=jwt_token
                )
                members = await task_retriever.call_tool(
                    'get_project_members',
                    project_id=project_id,
                    jwt_token=jwt_token
                )
                
                # Fetch detailed workloads for each member
                member_workloads = {}
                for member in members:
                    uid = member.get('_id')
                    if uid:
                        w = await task_retriever.call_tool(
                            'get_user_workload',
                            user_id=uid,
                            jwt_token=jwt_token
                        )
                        member_workloads[member.get('name')] = w

                state['retrieved_data'] = {
                    'tasks': tasks,
                    'members': members,
                    'member_workloads': member_workloads
                }
            
            elif state.get('context') == 'contract-audit':
                contract_id = state.get('contract_id')
                contract = await task_retriever.call_tool(
                    'get_contract_by_id',
                    contract_id=contract_id,
                    jwt_token=jwt_token
                )
                state['retrieved_data'] = {'contract': contract}
            
            state['steps_executed'].append('DataRetrieval')
        except Exception as e:
            state['errors'].append(f"DataRetrieval: {str(e)}")
        
        return state
    
    async def _node_analyze(self, state: AgentState):
        """Node 2: Analyze data with LLM"""
        try:
            prompt = f"""
            You are an expert project management AI. Analyze the following project data.
            
            Context: {state.get('context')}
            Query: {state['query']}
            Data: {json.dumps(state.get('retrieved_data', {}), indent=2)}
            
            Provide a clear, highly professional, and insightful analysis of 3-4 sentences.
            
            Formatting Rules:
            - Do NOT use any asterisks (*) or markdown bolding (**).
            - Do NOT use bullet points. Write in plain text paragraphs or use simple numbers like '1. ', '2. ' without any markdown formatting.
            - Ensure all references to team members or tasks use their descriptive names instead of raw database IDs where possible.
            """
            
            response = await query_llm(
                model=self.model,
                messages=[{"role": "user", "content": prompt}]
            )
            
            state['analysis'] = response
            state['steps_executed'].append('Analysis')
        except Exception as e:
            state['errors'].append(f"Analysis: {str(e)}")
        
        return state
    
    async def _node_synthesize(self, state: AgentState):
        """Node 3: Synthesize response"""
        try:
            context = state.get('context')
            prompt = ""
            
            if context == 'task-assignment':
                prompt = f"""
                You are a team coordinator AI. Recommend the best person to assign the new task to.
                
                Project Members & Workloads: {json.dumps(state['retrieved_data'].get('member_workloads', {}), indent=2)}
                Project Tasks: {json.dumps(state['retrieved_data'].get('tasks', []), indent=2)}
                
                Recommend the top 2-3 best assignees.
                For each recommendation, provide:
                - Name
                - Score (0 to 100 based on capacity, role, and current workload)
                - Reason for recommendation
                
                Formatting Rules:
                - Do NOT use any asterisks (*) or markdown bolding (**).
                - Format each recommendation clearly on its own line (e.g. "Recommendation 1: Name (Score: X) - Reason").
                """
            elif context in ['dashboard', 'dashboard-enhanced']:
                prompt = f"""
                You are a project manager AI. Based on the project health and workload data, provide 2-3 strategic recommendations to improve project execution.
                
                Health Data: {json.dumps(state['retrieved_data'].get('health', {}), indent=2)}
                Team Risks: {json.dumps(state['retrieved_data'].get('risks', {}), indent=2)}
                Overdue Tasks: {json.dumps(state['retrieved_data'].get('overdue', []), indent=2)}
                
                Provide 2-3 clear, actionable recommendations.
                
                Formatting Rules:
                - Do NOT use any asterisks (*) or markdown bolding (**).
                - Do NOT use bullet points. Format each recommendation on a new line starting with "Recommendation 1: ", "Recommendation 2: ", etc.
                """
            elif context == 'contract-audit':
                prompt = f"""
                You are a legal compliance AI. Based on the contract text, synthesize 2-3 specific compliance suggestions or legal risk highlights.
                
                Contract Data: {json.dumps(state['retrieved_data'].get('contract', {}), indent=2)}
                
                Provide 2-3 clear, actionable recommendations or compliance highlights.
                
                Formatting Rules:
                - Do NOT use any asterisks (*) or markdown bolding (**).
                - Do NOT use bullet points. Format each recommendation on a new line starting with "Recommendation 1: ", "Recommendation 2: ", etc.
                """
            
            if prompt:
                response = await query_llm(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}]
                )
                state['recommendations'] = response
            else:
                state['recommendations'] = 'None'
                
            state['steps_executed'].append('Synthesis')
        except Exception as e:
            state['errors'].append(f"Synthesis: {str(e)}")
        
        return state
    
    async def _node_finalize(self, state: AgentState):
        """Node 4: Prepare final response"""
        state['final_response'] = f"""
        📊 AI Analysis Report
        
        Query: {state['query']}
        Context: {state.get('context')}
        
        Analysis:
        {state.get('analysis', 'No analysis available')}
        
        Recommendations:
        {state.get('recommendations', 'None')}
        
        Execution: {' → '.join(state.get('steps_executed', []))}
        """
        
        state['confidence'] = 0.85 if not state['errors'] else 0.60
        return state
    
    async def invoke(self, query: str, user_id: str, jwt_token: str, 
                    project_id: str = None, contract_id: str = None, context: str = 'dashboard'):
        """Run orchestration"""
        initial_state: AgentState = {
            'query': query,
            'user_id': user_id,
            'jwt_token': jwt_token,
            'project_id': project_id,
            'contract_id': contract_id,
            'context': context,
            'timestamp': datetime.now().isoformat(),
            'steps_executed': [],
            'errors': []
        }
        
        result = await self.graph.ainvoke(initial_state)
        return result

# Global instance
orchestrator = MultiAgentOrchestrator()
