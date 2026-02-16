-- Create workspaces_members table
CREATE TABLE IF NOT EXISTS workspaces_members (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_workspace_members_workspace_id
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT uk_workspace_member
        UNIQUE(workspace_id, user_id)
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_workspaces_members_workspace_id ON workspaces_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_members_user_id ON workspaces_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_members_role ON workspaces_members(role);
