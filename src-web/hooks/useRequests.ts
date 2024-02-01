import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function requestsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['http_requests', { workspaceId }];
}

export function useRequests() {
  const workspaceId = useActiveWorkspaceId();
  return (
    useQuery({
      enabled: workspaceId != null,
      queryKey: requestsQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
      queryFn: async () => {
        if (workspaceId == null) return [];
        return (await invoke('cmd_list_requests', { workspaceId })) as HttpRequest[];
      },
    }).data ?? []
  );
}
