package agent_access

# Admin can access everything
allow_admin {
    input.user.role == "admin"
}

# Members can only access public contracts
allow_member_public {
    input.user.role == "member"
    input.tool == "analyze_contract"
    input.contract.status == "public"
}

# Allow data retrieval for all
allow_retrieval {
    input.tool == "get_tasks_by_project"
    input.user.authenticated == true
}

allow {
    allow_admin
}

allow {
    allow_member_public
}

allow {
    allow_retrieval
}
