"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeads, createLead } from "@/services/leads.service";

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
    staleTime: 5 * 60 * 1000,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
