import { z } from "zod";

// Permission and Role Management schemas (based on Spatie Laravel Permission migrations)
// Tables: permissions, roles, model_has_permissions, model_has_roles, role_has_permissions

// Role schemas (based on roles table migration)
export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"), // UNIQUE with guard_name in migration
  guard_name: z.string().default("web"), // Guard name, defaults to 'web'
  permissions: z.array(z.coerce.number()).optional(), // Permission IDs to assign to role
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  guard_name: z.string().default("web"),
  permissions: z.array(z.coerce.number()).optional(),
});

// Permission schemas (based on permissions table migration)
export const createPermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"), // UNIQUE with guard_name in migration
  guard_name: z.string().default("web"), // Guard name, defaults to 'web'
});

export const updatePermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  guard_name: z.string().default("web"),
});

// Assign role to user (based on model_has_roles table)
export const assignRoleSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"), // model_id in migration
  role_id: z.coerce.number().min(1, "Role is required"),
  model_type: z.string().default("App\\\\Models\\\\User"), // model_type in migration
});

// Assign permission directly to user (based on model_has_permissions table)
export const assignPermissionToUserSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"), // model_id in migration
  permission_id: z.coerce.number().min(1, "Permission is required"),
  model_type: z.string().default("App\\\\Models\\\\User"), // model_type in migration
});

// Assign permission to role (based on role_has_permissions table)
export const assignPermissionToRoleSchema = z.object({
  role_id: z.coerce.number().min(1, "Role is required"),
  permission_id: z.coerce.number().min(1, "Permission is required"),
});

// Bulk role assignment
export const bulkAssignRolesSchema = z.object({
  user_ids: z.array(z.coerce.number()).min(1, "At least one user must be selected"),
  role_ids: z.array(z.coerce.number()).min(1, "At least one role must be selected"),
  replace_existing: z.boolean().default(false), // Whether to replace existing roles or add to them
});

// Bulk permission assignment to users
export const bulkAssignPermissionsToUsersSchema = z.object({
  user_ids: z.array(z.coerce.number()).min(1, "At least one user must be selected"),
  permission_ids: z.array(z.coerce.number()).min(1, "At least one permission must be selected"),
  replace_existing: z.boolean().default(false),
});

// Bulk permission assignment to roles
export const bulkAssignPermissionsToRolesSchema = z.object({
  role_ids: z.array(z.coerce.number()).min(1, "At least one role must be selected"),
  permission_ids: z.array(z.coerce.number()).min(1, "At least one permission must be selected"),
  replace_existing: z.boolean().default(false),
});

// Remove role from user
export const removeRoleSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  role_id: z.coerce.number().min(1, "Role is required"),
});

// Remove permission from user
export const removePermissionFromUserSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  permission_id: z.coerce.number().min(1, "Permission is required"),
});

// Remove permission from role
export const removePermissionFromRoleSchema = z.object({
  role_id: z.coerce.number().min(1, "Role is required"),
  permission_id: z.coerce.number().min(1, "Permission is required"),
});

// Sync roles for user (replace all current roles with new ones)
export const syncUserRolesSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  role_ids: z.array(z.coerce.number()), // Can be empty array to remove all roles
});

// Sync permissions for user (replace all current direct permissions with new ones)
export const syncUserPermissionsSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  permission_ids: z.array(z.coerce.number()), // Can be empty array to remove all permissions
});

// Sync permissions for role (replace all current permissions with new ones)
export const syncRolePermissionsSchema = z.object({
  role_id: z.coerce.number().min(1, "Role is required"),
  permission_ids: z.array(z.coerce.number()), // Can be empty array to remove all permissions
});

// Check user permissions/roles
export const checkUserPermissionSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  permission: z.string().min(1, "Permission name is required"),
  guard_name: z.string().default("web"),
});

export const checkUserRoleSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  role: z.string().min(1, "Role name is required"),
  guard_name: z.string().default("web"),
});

// Permission/Role filtering and search
export const roleFilterSchema = z.object({
  search: z.string().optional(),
  guard_name: z.string().optional(),
  has_users: z.boolean().optional(), // Filter roles that have users assigned
  permission_id: z.coerce.number().optional(), // Filter roles that have specific permission
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const permissionFilterSchema = z.object({
  search: z.string().optional(),
  guard_name: z.string().optional(),
  role_id: z.coerce.number().optional(), // Filter permissions assigned to specific role
  user_id: z.coerce.number().optional(), // Filter permissions assigned to specific user
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const userPermissionFilterSchema = z.object({
  user_id: z.coerce.number().min(1, "User is required"),
  include_role_permissions: z.boolean().default(true), // Include permissions from roles
  include_direct_permissions: z.boolean().default(true), // Include direct permissions
  guard_name: z.string().optional(),
});

// Predefined role creation for common roles (Manager, Teacher, Student)
export const createManagerRoleSchema = z.object({
  name: z.string().default("manager"),
  guard_name: z.string().default("web"),
  permissions: z.array(z.string()).default([
    "manage_all",
    "manage_users",
    "manage_classrooms", 
    "manage_subjects",
    "manage_exams",
    "view_reports",
  ]),
});

export const createTeacherRoleSchema = z.object({
  name: z.string().default("teacher"),
  guard_name: z.string().default("web"),
  permissions: z.array(z.string()).default([
    "view_own_subjects",
    "manage_own_exams",
    "grade_exams",
    "view_students",
    "manage_classroom_students",
  ]),
});

export const createStudentRoleSchema = z.object({
  name: z.string().default("student"),
  guard_name: z.string().default("web"),
  permissions: z.array(z.string()).default([
    "take_exams",
    "view_own_results",
    "view_own_profile",
    "download_own_rapport",
  ]),
});

// Role hierarchy and inheritance
export const roleHierarchySchema = z.object({
  parent_role_id: z.coerce.number().min(1, "Parent role is required"),
  child_role_id: z.coerce.number().min(1, "Child role is required"),
}).refine((data) => {
  return data.parent_role_id !== data.child_role_id;
}, {
  message: "Parent and child roles must be different",
  path: ["child_role_id"],
});

// Export form data types
export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;
export type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionFormData = z.infer<typeof updatePermissionSchema>;
export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
export type AssignPermissionToUserFormData = z.infer<typeof assignPermissionToUserSchema>;
export type AssignPermissionToRoleFormData = z.infer<typeof assignPermissionToRoleSchema>;
export type BulkAssignRolesFormData = z.infer<typeof bulkAssignRolesSchema>;
export type BulkAssignPermissionsToUsersFormData = z.infer<typeof bulkAssignPermissionsToUsersSchema>;
export type BulkAssignPermissionsToRolesFormData = z.infer<typeof bulkAssignPermissionsToRolesSchema>;
export type RemoveRoleFormData = z.infer<typeof removeRoleSchema>;
export type RemovePermissionFromUserFormData = z.infer<typeof removePermissionFromUserSchema>;
export type RemovePermissionFromRoleFormData = z.infer<typeof removePermissionFromRoleSchema>;
export type SyncUserRolesFormData = z.infer<typeof syncUserRolesSchema>;
export type SyncUserPermissionsFormData = z.infer<typeof syncUserPermissionsSchema>;
export type SyncRolePermissionsFormData = z.infer<typeof syncRolePermissionsSchema>;
export type CheckUserPermissionFormData = z.infer<typeof checkUserPermissionSchema>;
export type CheckUserRoleFormData = z.infer<typeof checkUserRoleSchema>;
export type RoleFilterFormData = z.infer<typeof roleFilterSchema>;
export type PermissionFilterFormData = z.infer<typeof permissionFilterSchema>;
export type UserPermissionFilterFormData = z.infer<typeof userPermissionFilterSchema>;
export type CreateManagerRoleFormData = z.infer<typeof createManagerRoleSchema>;
export type CreateTeacherRoleFormData = z.infer<typeof createTeacherRoleSchema>;
export type CreateStudentRoleFormData = z.infer<typeof createStudentRoleSchema>;
export type RoleHierarchyFormData = z.infer<typeof roleHierarchySchema>;