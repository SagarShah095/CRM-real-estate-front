"use client";

/**
 * useDropdownData – cache-first hook for Leads, Projects, and Users
 *
 * Strategy:
 *  1. On mount, read each entity from the TanStack Query cache via
 *     `queryClient.getQueryData(key)`.
 *  2. If the cache already has data, that data is used immediately and NO
 *     network request is made (enabled: false).
 *  3. If the cache is empty the standard `useQuery` call runs once and
 *     populates the cache.  Every subsequent consumer (modal, view, …) will
 *     hit the cache instead.
 */

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjects } from "@/services/projects.service";
import { getUsers } from "@/services/api";
import { getLeads } from "@/services/leads.service";

// ─── helpers ───────────────────────────────────────────────────────────────

function hasData(cached) {
  if (!cached) return false;
  const list =
    cached?.data?.projects ||
    cached?.data?.users ||
    cached?.data?.leads ||
    cached?.data?.data ||
    cached?.data ||
    cached?.projects ||
    cached?.users ||
    cached?.leads ||
    (Array.isArray(cached) ? cached : null);
  return Array.isArray(list) && list.length > 0;
}

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;
const BASE_OPTIONS = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

// ─── Projects ──────────────────────────────────────────────────────────────

export function useProjectsDataQuery(params = {}, options = {}) {
  const queryClient = useQueryClient();
  const key = ["projects", params];
  const cached = queryClient.getQueryData(key);
  const hasCachedData = hasData(cached);

  return useQuery({
    queryKey: key,
    queryFn: () => getProjects(params),
    enabled: options.enabled !== false && !hasCachedData,
    placeholderData: cached,
    ...BASE_OPTIONS,
    ...options,
    ...(options.enabled === false ? { enabled: false } : {}),
  });
}

// ─── Users ──────────────────────────────────────────────────────────────────

export function useUsersDataQuery(params = {}, options = {}) {
  const queryClient = useQueryClient();
  const key = ["users", params];
  const cached = queryClient.getQueryData(key);
  const hasCachedData = hasData(cached);

  return useQuery({
    queryKey: key,
    queryFn: () => getUsers(params),
    enabled: options.enabled !== false && !hasCachedData,
    placeholderData: cached,
    ...BASE_OPTIONS,
    ...options,
    ...(options.enabled === false ? { enabled: false } : {}),
  });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export function useLeadsDataQuery(params = {}, options = {}) {
  const queryClient = useQueryClient();
  const key = ["leads", params];
  const cached = queryClient.getQueryData(key);
  const hasCachedData = hasData(cached);

  return useQuery({
    queryKey: key,
    queryFn: () => getLeads(params),
    enabled: options.enabled !== false && !hasCachedData,
    placeholderData: cached,
    ...BASE_OPTIONS,
    staleTime: 2 * 60 * 1000,
    ...options,
    ...(options.enabled === false ? { enabled: false } : {}),
  });
}

// ─── Composite hook ─────────────────────────────────────────────────────────

export function useDropdownData({
  enabled = true,
  fetchLeads = true,
  currentAdminId = null,
} = {}) {
  const { data: projectsData, isLoading: isProjectsLoading } =
    useProjectsDataQuery({}, { enabled });

  const { data: usersData, isLoading: isUsersLoading } = useUsersDataQuery(
    {},
    { enabled },
  );

  const { data: leadsData, isLoading: isLeadsLoading } = useLeadsDataQuery(
    {},
    { enabled: enabled && fetchLeads },
  );

  const projectsList = useMemo(() => {
    const list =
      projectsData?.data?.projects ||
      projectsData?.data?.data ||
      projectsData?.data ||
      projectsData?.projects ||
      (Array.isArray(projectsData) ? projectsData : []);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((p) => ({
        id: p._id || p.id || p.code,
        code: p.code || p.id || p._id,
        name: p.name || p.title || p.projectName || "Unnamed Project",
      }));
    }
    return [];
  }, [projectsData]);

  const usersList = useMemo(() => {
    const rawList =
      usersData?.data?.users ||
      usersData?.data ||
      usersData?.users ||
      (Array.isArray(usersData) ? usersData : []);
    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    let filtered = rawList;
    if (currentAdminId) {
      const byAdmin = rawList.filter((u) => {
        const creator = u.createdBy || u.adminId || u.createdById || u.tenantId;
        if (!creator) return true;
        const creatorId =
          typeof creator === "object" ? creator._id || creator.id : creator;
        return String(creatorId) === String(currentAdminId);
      });
      filtered = byAdmin.length > 0 ? byAdmin : rawList;
    }

    return filtered.map((u) => ({
      id: u._id || u.id || u.userId,
      name:
        u.name ||
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        u.userName ||
        u.email ||
        "User",
      role: u.role || u.designation || u.department || "Agent",
    }));
  }, [usersData, currentAdminId]);

  const leadsList = useMemo(() => {
    const list =
      leadsData?.data?.leads ||
      leadsData?.data ||
      leadsData?.leads ||
      (Array.isArray(leadsData) ? leadsData : []);
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((l) => ({
      id: l._id || l.id || l.leadId,
      name: l.name || l.leadName || l.fullName || "Lead",
      mobile: l.phone || l.mobile || l.contactNumber || "",
      stage: l.stage || "new",
    }));
  }, [leadsData]);

  return {
    projectsList,
    usersList,
    leadsList,
    isLoading: isProjectsLoading || isUsersLoading,
    isLeadsLoading,
  };
}
