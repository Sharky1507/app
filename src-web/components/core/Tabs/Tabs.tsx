import classnames from 'classnames';
import type { ReactNode } from 'react';
import { memo, useEffect, useRef } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import type { RadioDropdownProps } from '../RadioDropdown';
import { RadioDropdown } from '../RadioDropdown';
import { HStack } from '../Stacks';

export type TabItem<T = string> = {
  value: string;
  label: string;
  options?: Omit<RadioDropdownProps<T>, 'children'>;
};

interface Props<T = unknown> {
  label: string;
  value?: string;
  onChangeValue: (value: string) => void;
  tabs: TabItem<T>[];
  tabListClassName?: string;
  className?: string;
  children: ReactNode;
}

export function Tabs<T>({
  value,
  onChangeValue,
  label,
  children,
  tabs,
  className,
  tabListClassName,
}: Props<T>) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (value: string) => {
    const tabs = ref.current?.querySelectorAll<HTMLDivElement>(`[data-tab]`);
    for (const tab of tabs ?? []) {
      const v = tab.getAttribute('data-tab');
      if (v === value) {
        tab.setAttribute('tabindex', '-1');
        tab.setAttribute('data-state', 'active');
        tab.setAttribute('aria-hidden', 'false');
        tab.style.display = 'block';
      } else {
        tab.setAttribute('data-state', 'inactive');
        tab.setAttribute('aria-hidden', 'true');
        tab.style.display = 'none';
      }
    }
    onChangeValue(value);
  };

  useEffect(() => {
    if (value === undefined) return;
    handleTabChange(value);
  }, [value]);

  return (
    <div
      ref={ref}
      className={classnames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      <div
        aria-label={label}
        className={classnames(tabListClassName, 'h-auto flex items-center overflow-auto pb-0.5')}
      >
        <HStack space={1}>
          {tabs.map((t) => {
            const isActive = t.value === value;
            const btnClassName = classnames(
              isActive ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:text-gray-900',
            );
            if (t.options) {
              return (
                <RadioDropdown
                  key={t.value}
                  items={t.options.items}
                  value={t.options.value}
                  onChange={t.options.onChange}
                >
                  <Button
                    color="custom"
                    size="sm"
                    onClick={isActive ? undefined : () => handleTabChange(t.value)}
                    className={btnClassName}
                  >
                    {t.options.items.find((i) => i.value === t.options?.value)?.label ?? ''}
                    <Icon icon="triangleDown" className="-mr-1.5" />
                  </Button>
                </RadioDropdown>
              );
            } else {
              return (
                <Button
                  key={t.value}
                  color="custom"
                  size="sm"
                  onClick={() => handleTabChange(t.value)}
                  className={btnClassName}
                >
                  {t.label}
                </Button>
              );
            }
          })}
        </HStack>
      </div>
      {children}
    </div>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabContent = memo(function TabContent({
  value,
  children,
  className,
}: TabContentProps) {
  return (
    <div
      tabIndex={-1}
      data-tab={value}
      className={classnames(className, 'tab-content', 'w-full h-full')}
    >
      {children}
    </div>
  );
});
