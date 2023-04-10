import type { HTMLAttributes, ReactElement } from 'react';
import React, { useRef } from 'react';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useTauriEvent } from '../hooks/useTauriEvent';
import { useTheme } from '../hooks/useTheme';
import type { DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { HotKey } from './core/HotKey';
import { Icon } from './core/Icon';

interface Props {
  requestId: string;
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
}

export function RequestActionsDropdown({ requestId, children }: Props) {
  const deleteRequest = useDeleteRequest(requestId);
  const duplicateRequest = useDuplicateRequest({ id: requestId, navigateAfter: true });
  const dropdownRef = useRef<DropdownRef>(null);
  const { appearance, toggleAppearance } = useTheme();

  useTauriEvent('toggle_settings', () => {
    dropdownRef.current?.toggle();
  });

  // TODO: Put this somewhere better
  useTauriEvent('duplicate_request', () => {
    duplicateRequest.mutate();
  });

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        {
          key: 'duplicate',
          label: 'Duplicate',
          onSelect: duplicateRequest.mutate,
          leftSlot: <Icon icon="copy" />,
          rightSlot: <HotKey modifier="Meta" keyName="D" />,
        },
        {
          key: 'delete',
          label: 'Delete',
          onSelect: deleteRequest.mutate,
          variant: 'danger',
          leftSlot: <Icon icon="trash" />,
        },
        { type: 'separator', label: 'Yaak Settings' },
        {
          key: 'appearance',
          label: appearance === 'dark' ? 'Light Theme' : 'Dark Theme',
          onSelect: toggleAppearance,
          leftSlot: <Icon icon={appearance === 'dark' ? 'sun' : 'moon'} />,
        },
      ]}
    >
      {children}
    </Dropdown>
  );
}
