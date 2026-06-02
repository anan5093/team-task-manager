from mcp_servers.base import BaseMCPServer
from typing import Optional, List
from config import settings

class TaskRetrieverServer(BaseMCPServer):
    def __init__(self):
        super().__init__("TaskRetriever")
        
        self.register_tool(
            "get_tasks_by_project",
            "Fetch all tasks for a specific project",
            self.get_tasks_by_project
        )
        self.register_tool(
            "get_user_workload",
            "Get total tasks assigned to a user",
            self.get_user_workload
        )
        self.register_tool(
            "get_overdue_tasks",
            "Get all overdue tasks in a project",
            self.get_overdue_tasks
        )
        self.register_tool(
            "get_project_members",
            "Fetch all members assigned to a specific project",
            self.get_project_members
        )
        self.register_tool(
            "get_contract_by_id",
            "Fetch details and content of a specific contract",
            self.get_contract_by_id
        )
    
    async def get_tasks_by_project(self, project_id: str, jwt_token: str) -> List[dict]:
        """Retrieve tasks for a project"""
        return await self._call_express_api(
            'GET',
            '/tasks',
            params={'project': project_id},
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
    
    async def get_user_workload(self, user_id: str, jwt_token: str) -> dict:
        """Calculate user workload"""
        tasks = await self._call_express_api(
            'GET',
            '/tasks',
            params={'user': user_id},
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        
        return {
            "user_id": user_id,
            "total_tasks": len(tasks),
            "by_status": {
                "todo": len([t for t in tasks if t.get("status") == "todo"]),
                "in_progress": len([t for t in tasks if t.get("status") == "in-progress"]),
                "done": len([t for t in tasks if t.get("status") == "done"])
            }
        }
    
    async def get_overdue_tasks(self, project_id: str, jwt_token: str) -> List[dict]:
        """Get overdue tasks"""
        from datetime import datetime
        tasks = await self.get_tasks_by_project(project_id, jwt_token)
        
        overdue = [
            t for t in tasks
            if datetime.fromisoformat(t.get("dueDate", "").replace('Z', '+00:00')) < datetime.now(datetime.now().astimezone().tzinfo)
            and t.get("status") != "done"
        ]
        return overdue

    async def get_project_members(self, project_id: str, jwt_token: str) -> List[dict]:
        """Retrieve project members"""
        project = await self._call_express_api(
            'GET',
            f'/projects/{project_id}',
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        return project.get("members", [])

    async def get_contract_by_id(self, contract_id: str, jwt_token: str) -> dict:
        """Retrieve contract details and content"""
        response = await self._call_express_api(
            'GET',
            f'/contracts/{contract_id}/analyze',
            headers={'Authorization': f'Bearer {jwt_token}'}
        )
        return response.get("contract", {})

# Global instance
task_retriever = TaskRetrieverServer()
