"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
} from "@/services/api";

/**
 * Query Hook to fetch and cache Admins/Tenants data.
 * Configured so cached data remains fresh in memory without repeated GET calls on render/modal open/focus.
 */
export function useAdminsQuery(params = {}) {
  return useQuery({
    queryKey: ["admins", params],
    queryFn: async () => {
      const response = await getAdmins(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
    refetchOnWindowFocus: false, // Prevent refetching when switching window focus
    refetchOnMount: false, // Prevent auto-refetching on component re-mount if cached
    refetchOnReconnect: false,
  });
}

/**
 * Mutation Hook to Create an Admin / Provision a Tenant.
 * Updates local cache instantly and triggers GET /admins to re-sync cache with latest backend data.
 */
export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createAdmin(data),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const createdAdmin =
          response?.data || response?.admin || response || variables;

        queryClient.setQueriesData({ queryKey: ["admins"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return [createdAdmin, ...old];
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: [createdAdmin, ...old.data],
              pagination: old.pagination
                ? {
                    ...old.pagination,
                    total: (old.pagination.total || 0) + 1,
                  }
                : old.pagination,
            };
          }
          return old;
        });

        // Trigger GET /admins to update cache memory with server state
        queryClient.invalidateQueries({ queryKey: ["admins"] });
      }
    },
  });
}

/**
 * Mutation Hook to Update Admin / Tenant Details.
 * Updates cache directly and re-syncs GET /admins.
 */
export function useUpdateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAdmin(id, data),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const updatedAdmin =
          response?.data || response?.admin || variables.data || {};
        const targetId = variables.id;

        queryClient.setQueriesData({ queryKey: ["admins"] }, (old) => {
          if (!old) return old;
          const updateItem = (item) => {
            const itemId = item._id || item.id;
            if (itemId === targetId) {
              return { ...item, ...updatedAdmin, ...variables.data };
            }
            return item;
          };

          if (Array.isArray(old)) {
            return old.map(updateItem);
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.map(updateItem),
            };
          }
          return old;
        });

        // Trigger GET /admins to update cache memory with server state
        queryClient.invalidateQueries({ queryKey: ["admins"] });
      }
    },
  });
}

/**
 * Mutation Hook to Update Admin Status (Active / Suspended).
 * Updates status in cache and re-syncs GET /admins.
 */
export function useUpdateAdminStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateAdminStatus(id, status),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const targetId = variables.id;
        const nextStatus = variables.status;

        queryClient.setQueriesData({ queryKey: ["admins"] }, (old) => {
          if (!old) return old;
          const updateItem = (item) => {
            const itemId = item._id || item.id;
            if (itemId === targetId) {
              return { ...item, status: nextStatus };
            }
            return item;
          };

          if (Array.isArray(old)) {
            return old.map(updateItem);
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.map(updateItem),
            };
          }
          return old;
        });

        // Trigger GET /admins to update cache memory with server state
        queryClient.invalidateQueries({ queryKey: ["admins"] });
      }
    },
  });
}

/**
 * Mutation Hook to Delete an Admin / Tenant.
 * Removes item from cache and re-syncs GET /admins.
 */
export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteAdmin(id),
    onSuccess: (response, targetId) => {
      if (response?.success !== false && !response?.error) {
        queryClient.setQueriesData({ queryKey: ["admins"] }, (old) => {
          if (!old) return old;
          const filterItem = (item) => (item._id || item.id) !== targetId;

          if (Array.isArray(old)) {
            return old.filter(filterItem);
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.filter(filterItem),
              pagination: old.pagination
                ? {
                    ...old.pagination,
                    total: Math.max(0, (old.pagination.total || 0) - 1),
                  }
                : old.pagination,
            };
          }
          return old;
        });

        // Trigger GET /admins to update cache memory with server state
        queryClient.invalidateQueries({ queryKey: ["admins"] });
      }
    },
  });
}
