from mcp_servers.base import BaseMCPServer
import json
from datetime import datetime

class ReportSynthesizerServer(BaseMCPServer):
    def __init__(self):
        super().__init__("ReportSynthesizer")
        
        self.register_tool(
            "generate_summary",
            "Generate natural language summary of project",
            self.generate_summary
        )
        
        self.register_tool(
            "generate_detailed_report",
            "Generate detailed structured report with metrics",
            self.generate_detailed_report
        )
    
    async def generate_summary(self, project_id: str, jwt_token: str) -> str:
        """Generate text summary"""
        tasks = await self._call_express_api(
            'GET',
            '/tasks',
            params={'project': project_id},
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        
        completed = len([t for t in tasks if t.get("status") == "done"])
        in_progress = len([t for t in tasks if t.get("status") == "in-progress"])
        todo = len([t for t in tasks if t.get("status") == "todo"])
        
        return f"""
        📊 Project Summary
        ✅ Completed: {completed} tasks
        🚀 In Progress: {in_progress} tasks
        📋 To Do: {todo} tasks
        Total: {len(tasks)} tasks
        """
    
    async def generate_detailed_report(self, project_id: str, analytics_data: dict, jwt_token: str) -> str:
        """Generate detailed structured report"""
        try:
            # Fetch additional context
            project = await self._call_express_api(
                'GET',
                f'/projects/{project_id}',
                headers={'Authorization': f'Bearer {jwt_token}'}
            )
            
            report = {
                "timestamp": datetime.now().isoformat(),
                "project": {
                    "name": project.get("name", "Unknown"),
                    "id": project_id
                },
                "overview": self._generate_overview(analytics_data),
                "metrics": self._generate_metrics(analytics_data),
                "risks": self._generate_risk_assessment(analytics_data),
                "recommendations": self._generate_recommendations(analytics_data),
                "team_analysis": self._generate_team_analysis(analytics_data)
            }
            
            return json.dumps(report, indent=2)
        except Exception as e:
            return f"Error generating detailed report: {str(e)}"
    
    def _generate_overview(self, data):
        """Generate executive overview"""
        health_score = data.get('metrics', {}).get('healthScore', 0)
        completion = data.get('metrics', {}).get('completionRate', 0)
        
        health_status = "🟢 Healthy" if health_score >= 75 else "🟡 At Risk" if health_score >= 50 else "🔴 Critical"
        
        return {
            "status": health_status,
            "health_score": health_score,
            "completion_rate": completion,
            "summary": f"Project is {health_status.split(' ')[1].lower()} with {completion}% completion rate"
        }
    
    def _generate_metrics(self, data):
        """Generate detailed metrics"""
        tasks = data.get('tasks', {})
        metrics = data.get('metrics', {})
        
        return {
            "task_distribution": {
                "total": tasks.get('total', 0),
                "completed": tasks.get('completed', 0),
                "in_progress": tasks.get('inProgress', 0),
                "todo": tasks.get('todo', 0),
                "overdue": tasks.get('overdue', 0)
            },
            "performance": {
                "completion_rate": f"{metrics.get('completionRate', 0)}%",
                "velocity": metrics.get('velocity', 0),
                "avg_tasks_per_member": metrics.get('avgTasksPerUser', 0)
            },
            "timeline": {
                "due_soon": tasks.get('dueSoon', 0),
                "overdue": tasks.get('overdue', 0)
            }
        }
    
    def _generate_risk_assessment(self, data):
        """Generate risk assessment"""
        risks = data.get('riskFactors', [])
        
        critical_risks = [r for r in risks if r.get('level') == 'critical']
        high_risks = [r for r in risks if r.get('level') == 'high']
        medium_risks = [r for r in risks if r.get('level') == 'medium']
        
        return {
            "overall_risk_level": "Critical" if critical_risks else "High" if high_risks else "Medium" if medium_risks else "Low",
            "critical": [{"title": r.get("title"), "description": r.get("description")} for r in critical_risks],
            "high": [{"title": r.get("title"), "description": r.get("description")} for r in high_risks],
            "medium": [{"title": r.get("title"), "description": r.get("description")} for r in medium_risks]
        }
    
    def _generate_recommendations(self, data):
        """Generate actionable recommendations"""
        tasks = data.get('tasks', {})
        overdue = tasks.get('overdue', 0)
        todo = tasks.get('todo', 0)
        
        recommendations = []
        
        if overdue > 0:
            recommendations.append({
                "priority": "CRITICAL",
                "action": "Address Overdue Tasks Immediately",
                "rationale": f"{overdue} task(s) are overdue. This impacts project timeline and team credibility.",
                "steps": [
                    "Review all overdue tasks with team leads",
                    "Identify blockers preventing completion",
                    "Reassign or provide additional resources if needed"
                ]
            })
        
        if todo > tasks.get('total', 1) * 0.5:
            recommendations.append({
                "priority": "HIGH",
                "action": "Increase Task Execution",
                "rationale": f"Over 50% of tasks remain in to-do status ({todo} tasks). Acceleration needed.",
                "steps": [
                    "Prioritize high-impact tasks",
                    "Break down large tasks into smaller chunks",
                    "Increase team focus and reduce context switching"
                ]
            })
        
        if tasks.get('inProgress', 0) < tasks.get('total', 1) * 0.2:
            recommendations.append({
                "priority": "HIGH",
                "action": "Boost In-Progress Work",
                "rationale": "Low number of tasks actively being worked on. Increase velocity.",
                "steps": [
                    "Identify capacity to pull more tasks into active work",
                    "Ensure team has clear priorities",
                    "Remove blockers preventing task start"
                ]
            })
        
        if not recommendations:
            recommendations.append({
                "priority": "MEDIUM",
                "action": "Maintain Current Momentum",
                "rationale": "Project is progressing well. Focus on consistency.",
                "steps": [
                    "Continue current pace and quality standards",
                    "Monitor for any emerging risks",
                    "Celebrate team wins and milestones"
                ]
            })
        
        return recommendations
    
    def _generate_team_analysis(self, data):
        """Generate team workload analysis"""
        workload = data.get('userWorkload', [])
        
        overloaded = [u for u in workload if u.get('todo', 0) + u.get('inProgress', 0) > 5]
        underutilized = [u for u in workload if u.get('total', 0) <= 1]
        
        return {
            "team_size": len(workload),
            "overloaded_members": [{"name": u.get("name"), "tasks": u.get("total"), "pending": u.get("todo") + u.get("inProgress")} for u in overloaded],
            "underutilized_members": [{"name": u.get("name"), "tasks": u.get("total")} for u in underutilized],
            "distribution_health": "Balanced" if not overloaded and not underutilized else "Imbalanced - Optimization Needed"
        }

# Global instance
report_synthesizer = ReportSynthesizerServer()
