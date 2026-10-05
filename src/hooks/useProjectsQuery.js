"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projects.service";

/**
 * Query Hook to fetch and cache Real Estate Projects data.
 * Endpoint: GET /api/v1/projects
 */
export function useProjectsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => {
      const response = await getProjects(params);
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
 * Mutation Hook to Create a Project.
 * Endpoint: POST /api/v1/projects
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createProject(data),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const createdProject =
          response?.data?.project ||
          response?.data ||
          response?.project ||
          response ||
          variables;

        queryClient.setQueriesData({ queryKey: ["projects"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return [createdProject, ...old];
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: [createdProject, ...old.data],
              pagination: old.pagination
                ? {
                    ...old.pagination,
                    total: (old.pagination.total || 0) + 1,
                  }
                : old.pagination,
            };
          }
          if (Array.isArray(old?.data?.projects)) {
            return {
              ...old,
              data: {
                ...old.data,
                projects: [createdProject, ...old.data.projects],
              },
            };
          }
          return old;
        });

        // Invalidate queries to ensure fresh server data
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
  });
}

/**
 * Mutation Hook to Update a Project.
 * Endpoint: PUT /api/v1/projects/:id
 */
export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const updatedProject =
          response?.data?.project ||
          response?.data ||
          response?.project ||
          variables.data ||
          {};
        const targetId = variables.id;

        queryClient.setQueriesData({ queryKey: ["projects"] }, (old) => {
          if (!old) return old;
          const updateItem = (item) => {
            const itemId = item._id || item.id;
            if (itemId === targetId) {
              return { ...item, ...updatedProject, ...variables.data };
            }
            return item;
          };

          if (Array.isArray(old)) return old.map(updateItem);
          if (Array.isArray(old?.data)) {
            return { ...old, data: old.data.map(updateItem) };
          }
          if (Array.isArray(old?.data?.projects)) {
            return {
              ...old,
              data: {
                ...old.data,
                projects: old.data.projects.map(updateItem),
              },
            };
          }
          return old;
        });

        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
  });
}

/**
 * Mutation Hook to Delete a Project.
 * Endpoint: DELETE /api/v1/projects/:id
 */
export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: (response, targetId) => {
      if (response?.success !== false && !response?.error) {
        queryClient.setQueriesData({ queryKey: ["projects"] }, (old) => {
          if (!old) return old;
          const filterItem = (item) => (item._id || item.id) !== targetId;

          if (Array.isArray(old)) return old.filter(filterItem);
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
          if (Array.isArray(old?.data?.projects)) {
            return {
              ...old,
              data: {
                ...old.data,
                projects: old.data.projects.filter(filterItem),
              },
            };
          }
          return old;
        });

        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
  });
}
