export const SUPER_ADMIN_DASHBOARD_COLLECTION = "super_admin_dashboard";
export const SUPER_ADMIN_DASHBOARD_DOC = "main";

export const RBAC_COLLECTIONS = {
  adminUsers: "admin_users",
  adminRoles: "admin_roles",
  auditLogs: "admin_audit_logs",
  sessions: "admin_sessions",
  securityEvents: "admin_security_events",
  accessRequests: "admin_access_requests",
  settings: "admin_settings",
  projectAccess: "project_access",
  modules: "modules",
};

export const RBAC_ROOT_PATH = [
  SUPER_ADMIN_DASHBOARD_COLLECTION,
  SUPER_ADMIN_DASHBOARD_DOC,
];

export const RBAC_PATHS = {
  adminUsers: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.adminUsers],
  adminRoles: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.adminRoles],
  auditLogs: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.auditLogs],
  sessions: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.sessions],
  securityEvents: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.securityEvents],
  accessRequests: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.accessRequests],
  settings: [...RBAC_ROOT_PATH, RBAC_COLLECTIONS.settings],
};

export const RBAC_ACTION_ALIASES = {
  read: ["read", "view"],
  view: ["view", "read"],
  write: ["write", "edit", "create", "publish"],
  create: ["create", "write"],
  edit: ["edit", "write"],
  delete: ["delete"],
  publish: ["publish", "write"],
  export: ["export"],
  manageUsers: ["manageUsers"],
};

export function getRbacRootLabel() {
  return `${SUPER_ADMIN_DASHBOARD_COLLECTION}/${SUPER_ADMIN_DASHBOARD_DOC}`;
}
