"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  bulkDeleteLeads,
} from "@/services/leads.service";

/**
 * Query Hook to fetch and cache CRM Leads data.
 * Endpoint: GET /api/v1/leads
 */
export function useLeadsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const response = await getLeads(params);
      return response;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...options,
  });
}

/**
 * Mutation Hook to Create a Lead.
 * Endpoint: POST /api/v1/leads
 */
export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createLead(data),
    retry: false,
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const createdLead =
          response?.data?.lead ||
          response?.data ||
          response?.lead ||
          response ||
          variables;

        // Optimistically prepend to any cached leads data
        queryClient.setQueriesData({ queryKey: ["leads"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return [createdLead, ...old];
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: [createdLead, ...old.data],
            };
          }
          if (Array.isArray(old?.data?.leads)) {
            return {
              ...old,
              data: {
                ...old.data,
                leads: [createdLead, ...old.data.leads],
              },
            };
          }
          if (Array.isArray(old?.leads)) {
            return {
              ...old,
              leads: [createdLead, ...old.leads],
            };
          }
          return old;
        });

        // Trigger refetch from server to ensure perfect consistency
        queryClient.invalidateQueries({ queryKey: ["leads"] });
      }
    },
  });
}

/**
 * Mutation Hook to Update a Lead.
 * Endpoint: PUT /leads/:id
 */
export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateLead(id, data),
    retry: false,
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const updatedLead =
          response?.data?.lead ||
          response?.data ||
          response?.lead ||
          response ||
          variables?.data;

        const updateItem = (item) => {
          const itemId = item.id || item._id || item.leadId;
          const targetId = variables.id;
          if (itemId === targetId || String(itemId) === String(targetId)) {
            return { ...item, ...updatedLead };
          }
          return item;
        };

        queryClient.setQueriesData({ queryKey: ["leads"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map(updateItem);
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.map(updateItem),
            };
          }
          if (Array.isArray(old?.data?.leads)) {
            return {
              ...old,
              data: {
                ...old.data,
                leads: old.data.leads.map(updateItem),
              },
            };
          }
          if (Array.isArray(old?.leads)) {
            return {
              ...old,
              leads: old.leads.map(updateItem),
            };
          }
          return old;
        });

        queryClient.invalidateQueries({ queryKey: ["leads"] });
      }
    },
  });
}

/**
 * Mutation Hook to Delete a Single Lead.
 * Endpoint: DELETE /leads/:id
 */
export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteLead(id),
    retry: false,
    onSuccess: (response, deletedId) => {
      if (response?.success !== false && !response?.error) {
        const filterItem = (item) => {
          const itemId = item.id || item._id || item.leadId;
          return itemId !== deletedId && String(itemId) !== String(deletedId);
        };

        queryClient.setQueriesData({ queryKey: ["leads"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.filter(filterItem);
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.filter(filterItem),
            };
          }
          if (Array.isArray(old?.data?.leads)) {
            return {
              ...old,
              data: {
                ...old.data,
                leads: old.data.leads.filter(filterItem),
              },
            };
          }
          if (Array.isArray(old?.leads)) {
            return {
              ...old,
              leads: old.leads.filter(filterItem),
            };
          }
          return old;
        });

        queryClient.invalidateQueries({ queryKey: ["leads"] });
      }
    },
  });
}

/**
 * Mutation Hook to Bulk Delete Leads.
 * Endpoint: POST /leads/bulk-delete
 * Body: { "ids": ["id1", "id2"] }
 */
export function useBulkDeleteLeadsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idsOrPayload) => bulkDeleteLeads(idsOrPayload),
    retry: false,
    onSuccess: (response, variables) => {
      if (response?.success !== false && !response?.error) {
        const targetIds = Array.isArray(variables)
          ? variables
          : variables?.ids || [];

        const targetIdStrings = new Set(targetIds.map((id) => String(id)));

        const filterItem = (item) => {
          const id = String(item.id || item._id || item.leadId || "");
          return !targetIdStrings.has(id);
        };

        queryClient.setQueriesData({ queryKey: ["leads"] }, (old) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.filter(filterItem);
          }
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.filter(filterItem),
            };
          }
          if (Array.isArray(old?.data?.leads)) {
            return {
              ...old,
              data: {
                ...old.data,
                leads: old.data.leads.filter(filterItem),
              },
            };
          }
          if (Array.isArray(old?.leads)) {
            return {
              ...old,
              leads: old.leads.filter(filterItem),
            };
          }
          return old;
        });

        queryClient.invalidateQueries({ queryKey: ["leads"] });
      }
    },
  });
}
