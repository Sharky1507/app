import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { requestsQueryKey, useRequests } from './useRequests';
import { useRoutes } from './useRoutes';

export function useCreateRequest({ navigateAfter }: { navigateAfter: boolean }) {
  const workspaceId = useActiveWorkspaceId();
  const routes = useRoutes();
  const requests = useRequests();
  const queryClient = useQueryClient();

  return useMutation<HttpRequest, unknown, Partial<Pick<HttpRequest, 'name' | 'sortPriority'>>>({
    mutationFn: (patch) => {
      if (workspaceId === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      const sortPriority = maxSortPriority(requests) + 1000;
      return invoke('create_request', { sortPriority, workspaceId, ...patch });
    },
    onSuccess: async (request) => {
      queryClient.setQueryData<HttpRequest[]>(
        requestsQueryKey({ workspaceId: request.workspaceId }),
        (requests) => [...(requests ?? []), request],
      );
      if (navigateAfter) {
        routes.navigate('request', { workspaceId: request.workspaceId, requestId: request.id });
      }
    },
  });
}

function maxSortPriority(requests: HttpRequest[]) {
  if (requests.length === 0) return 1000;
  return Math.max(...requests.map((r) => r.sortPriority));
}
