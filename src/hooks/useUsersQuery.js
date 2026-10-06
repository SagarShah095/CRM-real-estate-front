"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/api";

/**
 * Query Hook to fetch and cache Users data.
 * Endpoint: GET /api/v1/users
 */
export function useUsersQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await getUsers(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...options,
  });
}

/**
 * Mutation Hook to Create a User (Admin Only).
 * Endpoint: POST /api/v1/users
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createUser(data),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const createdUser =
          response?.data || response?.user || response || variables;

        queryClient.setQueriesData({ queryKey: ["users"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return [createdUser, ...old];
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: [createdUser, ...old.data],
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

        // Invalidate queries so cache is fresh
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
}

/**
 * Mutation Hook to Update a User.
 * Endpoint: PUT /api/v1/users/:id
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const updatedUser =
          response?.data || response?.user || variables.data || {};
        const targetId = variables.id;

        queryClient.setQueriesData({ queryKey: ["users"] }, (old) => {
          if (!old) return old;
          const updateItem = (item) => {
            const itemId = item._id || item.id;
            if (itemId === targetId) {
              return { ...item, ...updatedUser, ...variables.data };
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

        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
}

/**
 * Mutation Hook to Delete a User.
 * Endpoint: DELETE /api/v1/users/:id
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (response, targetId) => {
      if (response?.success !== false && !response?.error) {
        queryClient.setQueriesData({ queryKey: ["users"] }, (old) => {
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

        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
}
