"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
} from "@/services/tasks.service";

/**
 * Query Hook to fetch and cache Tasks data.
 * Endpoint: GET /api/v1/tasks
 */
export function useTasksQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const response = await getTasks(params);
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
 * Mutation Hook to Create a Task.
 * Endpoint: POST /api/v1/tasks
 */
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createTask(data),
    retry: false,
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const createdTask =
          response?.data?.task ||
          response?.data ||
          response?.task ||
          response ||
          variables;

        queryClient.setQueriesData({ queryKey: ["tasks"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return [createdTask, ...old];
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: [createdTask, ...old.data],
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
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/**
 * Mutation Hook to Update an Existing Task.
 * Endpoint: PATCH /api/v1/tasks/:id (or /tasks/:id)
 */
export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    retry: false,
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const updatedTask =
          response?.data?.task ||
          response?.data ||
          response?.task ||
          response ||
          variables?.data;

        queryClient.setQueriesData({ queryKey: ["tasks"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((item) =>
              item.id === variables.id || item._id === variables.id
                ? { ...item, ...updatedTask }
                : item
            );
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.map((item) =>
                item.id === variables.id || item._id === variables.id
                  ? { ...item, ...updatedTask }
                  : item
              ),
            };
          }
          return old;
        });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/**
 * Alias for useUpdateTaskMutation using PATCH /tasks/:id
 */
export const usePatchTaskMutation = useUpdateTaskMutation;

/**
 * Mutation Hook to Delete a Task.
 * Endpoint: DELETE /api/v1/tasks/:id
 */
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTask(id),
    retry: false,
    onSuccess: (_response, deletedId) => {
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.filter(
            (item) => item.id !== deletedId && item._id !== deletedId
          );
        }
        if (Array.isArray(old?.data)) {
          return {
            ...old,
            data: old.data.filter(
              (item) => item.id !== deletedId && item._id !== deletedId
            ),
            pagination: old.pagination
              ? {
                  ...old.pagination,
                  total: Math.max(0, (old.pagination.total || 1) - 1),
                }
              : old.pagination,
          };
        }
        return old;
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
