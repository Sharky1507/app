import { memo } from 'react';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateGrpcRequest } from '../hooks/useCreateGrpcRequest';
import { useCreateHttpRequest } from '../hooks/useCreateHttpRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { trackEvent } from '../lib/analytics';
import { BODY_TYPE_GRAPHQL } from '../lib/models';
import { Dropdown } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export const SidebarActions = memo(function SidebarActions() {
  const createHttpRequest = useCreateHttpRequest();
  const createGrpcRequest = useCreateGrpcRequest();
  const createFolder = useCreateFolder();
  const { hidden, show, hide } = useSidebarHidden();

  return (
    <HStack>
      <IconButton
        onClick={async () => {
          trackEvent('Sidebar', 'Toggle');

          // NOTE: We're not using `toggle` because it may be out of sync
          // from changes in other windows
          if (hidden) await show();
          else await hide();
        }}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        hotkeyAction="sidebar.toggle"
        icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <Dropdown
        openOnHotKeyAction="http_request.create"
        items={[
          {
            key: 'create-http-request',
            label: 'HTTP Request',
            onSelect: () => createHttpRequest.mutate({}),
          },
          {
            key: 'create-grpc-request',
            label: 'GRPC Request',
            onSelect: () => createGrpcRequest.mutate({}),
          },
          {
            key: 'create-graphql-request',
            label: 'GraphQL Request',
            onSelect: () =>
              createHttpRequest.mutate({ bodyType: BODY_TYPE_GRAPHQL, method: 'POST' }),
          },
          {
            key: 'create-folder',
            label: 'Folder',
            onSelect: () => createFolder.mutate({}),
          },
        ]}
      >
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </Dropdown>
    </HStack>
  );
});
