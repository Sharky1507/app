import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type { HotkeyAction } from '../../hooks/useHotKey';
import { useFormattedHotkey, useHotKey } from '../../hooks/useHotKey';
import { Icon } from './Icon';

export type ButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'color'> & {
  innerClassName?: string;
  color?: 'custom' | 'default' | 'gray' | 'primary' | 'secondary' | 'warning' | 'danger';
  variant?: 'border' | 'solid';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'xs';
  justify?: 'start' | 'center';
  type?: 'button' | 'submit';
  forDropdown?: boolean;
  disabled?: boolean;
  title?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  hotkeyAction?: HotkeyAction;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    isLoading,
    className,
    innerClassName,
    children,
    forDropdown,
    color = 'default',
    type = 'button',
    justify = 'center',
    size = 'md',
    variant = 'solid',
    leftSlot,
    rightSlot,
    disabled,
    hotkeyAction,
    title,
    onClick,
    ...props
  }: ButtonProps,
  ref,
) {
  const hotkeyTrigger = useFormattedHotkey(hotkeyAction ?? null)?.join('');
  const fullTitle = hotkeyTrigger ? `${title}  ${hotkeyTrigger}` : title;

  const classes = useMemo(
    () =>
      classNames(
        className,
        'max-w-full min-w-0', // Help with truncation
        'whitespace-nowrap outline-none',
        'flex-shrink-0 flex items-center',
        'focus-visible-or-class:ring rounded-md',
        disabled ? 'pointer-events-none opacity-disabled' : 'pointer-events-auto',
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        size === 'md' && 'h-md px-3',
        size === 'sm' && 'h-sm px-2.5 text-sm',
        size === 'xs' && 'h-xs px-2 text-sm',
        // Solids
        variant === 'solid' && color === 'custom' && 'ring-blue-500/50',
        variant === 'solid' &&
          color === 'default' &&
          'text-gray-700 enabled:hocus:bg-gray-700/10 enabled:hocus:text-gray-800 ring-blue-500/50',
        variant === 'solid' &&
          color === 'gray' &&
          'text-gray-800 bg-highlight enabled:hocus:text-gray-1000 ring-gray-400',
        variant === 'solid' && color === 'primary' && 'bg-blue-400 text-white ring-blue-700',
        variant === 'solid' && color === 'secondary' && 'bg-violet-400 text-white ring-violet-700',
        variant === 'solid' && color === 'warning' && 'bg-orange-400 text-white ring-orange-700',
        variant === 'solid' && color === 'danger' && 'bg-red-400 text-white ring-red-700',
        // Borders
        variant === 'border' && 'border',
        variant === 'border' &&
          color === 'default' &&
          'border-highlight text-gray-700 enabled:hocus:border-focus enabled:hocus:text-gray-800 ring-blue-500/50',
        variant === 'border' &&
          color === 'gray' &&
          'border-gray-500/70 text-gray-700 enabled:hocus:bg-gray-500/20 enabled:hocus:text-gray-800 ring-blue-500/50',
        variant === 'border' &&
          color === 'primary' &&
          'border-blue-500/70 text-blue-700 enabled:hocus:border-blue-500 ring-blue-500/50',
        variant === 'border' &&
          color === 'secondary' &&
          'border-violet-500/70 text-violet-700 enabled:hocus:border-violet-500 ring-violet-500/50',
        variant === 'border' &&
          color === 'warning' &&
          'border-orange-500/70 text-orange-700 enabled:hocus:border-orange-500 ring-orange-500/50',
        variant === 'border' &&
          color === 'danger' &&
          'border-red-500/70 text-red-700 enabled:hocus:border-red-500 ring-red-500/50',
      ),
    [className, disabled, justify, size, variant, color],
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle<HTMLButtonElement | null, HTMLButtonElement | null>(
    ref,
    () => buttonRef.current,
  );

  useHotKey(hotkeyAction ?? null, () => {
    buttonRef.current?.click();
  });

  return (
    <button
      ref={buttonRef}
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      title={fullTitle}
      {...props}
    >
      {isLoading ? (
        <Icon icon="update" size={size} className="animate-spin mr-1" />
      ) : leftSlot ? (
        <div className="mr-1">{leftSlot}</div>
      ) : null}
      <div
        className={classNames(
          'truncate w-full',
          justify === 'start' ? 'text-left' : 'text-center',
          innerClassName,
        )}
      >
        {children}
      </div>
      {rightSlot && <div className="ml-1">{rightSlot}</div>}
      {forDropdown && <Icon icon="chevronDown" size={size} className="ml-1 -mr-1" />}
    </button>
  );
});
