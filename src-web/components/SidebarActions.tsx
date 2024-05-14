import { useMemo } from 'react';
import { useFloatingSidebarHidden } from '../hooks/useFloatingSidebarHidden';
import { useShouldFloatSidebar } from '../hooks/useShouldFloatSidebar';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { trackEvent } from '../lib/analytics';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { CreateDropdown } from './CreateDropdown';

export function SidebarActions() {
  const floating = useShouldFloatSidebar();
  const [normalHidden, setNormalHidden] = useSidebarHidden();
  const [floatingHidden, setFloatingHidden] = useFloatingSidebarHidden();

  const hidden = floating ? floatingHidden : normalHidden;
  const setHidden = useMemo(
    () => (floating ? setFloatingHidden : setNormalHidden),
    [floating, setFloatingHidden, setNormalHidden],
  );

  return (
    <HStack className="h-full" alignItems="center">
      <IconButton
        onClick={async () => {
          trackEvent('sidebar', 'toggle');

          // NOTE: We're not using the (h) => !h pattern here because the data
          //  might be different if another window changed it (out of sync)
          await setHidden(!hidden);
        }}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        hotkeyAction="sidebar.toggle"
        icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <CreateDropdown hotKeyAction="http_request.create">
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </CreateDropdown>
    </HStack>
  );
}
