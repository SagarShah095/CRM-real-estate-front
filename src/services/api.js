/**
 * Central API Services Barrel & Aggregator
 *
 * Individual domain APIs are modularized into dedicated files:
 * - apiClient: Core HTTP client, Bearer token injection, session expiration handling
 * - auth.service: Login, Forgot Password, Reset Password, Role Redirection
 * - superAdmin.service: Super Admin Tenants & Subscription management (/api/v1/admins)
 * - adminUsers.service: Admin User & Agent management (/api/v1/users)
 * - projects.service: Real Estate Projects management (/api/v1/projects)
 */

export * from "./apiClient";
export * from "./auth.service";
export * from "./superAdmin.service";
export * from "./adminUsers.service";
export * from "./projects.service";

// Default export combining all service modules
import { authService } from "./auth.service";
import { superAdminService } from "./superAdmin.service";
import { adminUsersService } from "./adminUsers.service";
import { projectsService } from "./projects.service";
import { apiFetch } from "./apiClient";

export default {
  apiFetch,
  auth: authService,
  superAdmin: superAdminService,
  users: adminUsersService,
  projects: projectsService,
};
