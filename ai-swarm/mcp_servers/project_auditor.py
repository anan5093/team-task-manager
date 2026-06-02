from mcp_servers.base import BaseMCPServer
from datetime import datetime
from config import settings

class ProjectAuditorServer(BaseMCPServer):
    def __init__(self):
        super().__init__("ProjectAuditor")
        
        self.register_tool(
            "audit_project_health",
            "Analyze project health metrics",
            self.audit_project_health
        )
        self.register_tool(
            "detect_team_risks",
            "Identify team capacity and workload risks",
            self.detect_team_risks
        )
    
    async def audit_project_health(self, project_id: str, jwt_token: str) -> dict:
        """Audit project health"""
        project = await self._call_express_api(
            'GET',
            f'/projects/{project_id}',
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        
        tasks = await self._call_express_api(
            'GET',
            '/tasks',
            params={'project': project_id},
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        
        completed = len([t for t in tasks if t.get("status") == "done"])
        
        return {
            "project_id": project_id,
            "project_name": project.get("name"),
            "total_tasks": len(tasks),
            "completed": completed,
            "completion_rate": f"{(completed/len(tasks)*100):.1f}%" if tasks else "0%",
            "health_status": "🟢 Healthy" if completed/len(tasks) > 0.6 else "🔴 At Risk" if tasks else "⚪ No Data"
        }
    
    async def detect_team_risks(self, project_id: str, jwt_token: str) -> dict:
        """Detect risks in team"""
        tasks = await self._call_express_api(
            'GET',
            '/tasks',
            params={'project': project_id},
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        
        workload = {}
        for task in tasks:
            user_id = task.get("assignedUser", {}).get("_id")
            if user_id:
                if user_id not in workload:
                    workload[user_id] = 0
                workload[user_id] += 1
        
        overloaded = [uid for uid, count in workload.items() if count > 5]
        
        return {
            "overloaded_users": overloaded,
            "recommendation": "Redistribute tasks" if overloaded else "Good balance",
            "risk_level": "HIGH" if overloaded else "LOW"
        }

# Global instance
project_auditor = ProjectAuditorServer()
