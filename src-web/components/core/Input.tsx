import classNames from 'classnames';
import type { EditorView } from 'codemirror';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type { EditorProps } from './Editor';
import { Editor } from './Editor';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';

export type InputProps = Omit<HTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus'> &
  Pick<EditorProps, 'contentType' | 'useTemplating' | 'autocomplete' | 'forceUpdateKey'> & {
    name: string;
    type?: 'text' | 'password';
    label: string;
    hideLabel?: boolean;
    labelClassName?: string;
    containerClassName?: string;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    defaultValue?: string;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
    size?: 'sm' | 'md';
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
    validate?: (v: string) => boolean;
    require?: boolean;
  };

export const Input = forwardRef<EditorView | undefined, InputProps>(function Input(
  {
    label,
    type = 'text',
    hideLabel,
    className,
    containerClassName,
    labelClassName,
    onChange,
    placeholder,
    size = 'md',
    name,
    leftSlot,
    rightSlot,
    defaultValue,
    validate,
    require,
    onFocus,
    onBlur,
    forceUpdateKey,
    ...props
  }: InputProps,
  ref,
) {
  const [obscured, setObscured] = useState(type === 'password');
  const [currentValue, setCurrentValue] = useState(defaultValue ?? '');
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  const id = `input-${name}`;
  const inputClassName = classNames(
    className,
    '!bg-transparent min-w-0 h-full w-full focus:outline-none placeholder:text-placeholder',
    // Bump things over if the slots are occupied
    leftSlot && 'pl-0.5 -ml-2',
    rightSlot && 'pr-0.5 -mr-2',
  );

  const isValid = useMemo(() => {
    if (require && !validateRequire(currentValue)) return false;
    if (validate && !validate(currentValue)) return false;
    return true;
  }, [currentValue, validate, require]);

  const handleChange = useCallback(
    (value: string) => {
      setCurrentValue(value);
      onChange?.(value);
    },
    [onChange],
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const form = wrapperRef.current?.closest('form');
    if (!isValid || form == null) return;

    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }, [isValid]);

  return (
    <VStack ref={wrapperRef} className="w-full">
      <label
        htmlFor={id}
        className={classNames(
          labelClassName,
          'font-semibold text-xs uppercase text-gray-700',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <HStack
        alignItems="center"
        className={classNames(
          containerClassName,
          'relative w-full rounded-md text-gray-900',
          'border',
          focused ? 'border-focus' : 'border-highlight',
          !isValid && '!border-invalid',
          size === 'md' && 'h-md leading-md',
          size === 'sm' && 'h-sm leading-sm',
        )}
      >
        {leftSlot}
        <Editor
          ref={ref}
          id={id}
          singleLine
          onSubmit={handleSubmit}
          type={type === 'password' && !obscured ? 'text' : type}
          defaultValue={defaultValue}
          forceUpdateKey={forceUpdateKey}
          placeholder={placeholder}
          onChange={handleChange}
          className={inputClassName}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {type === 'password' && (
          <IconButton
            title={obscured ? `Show ${label}` : `Obscure ${label}`}
            size="xs"
            className="mr-0.5"
            iconSize="sm"
            icon={obscured ? 'eyeClosed' : 'eye'}
            onClick={() => setObscured((o) => !o)}
          />
        )}
        {rightSlot}
      </HStack>
    </VStack>
  );
});

function validateRequire(v: string) {
  return v.length > 0;
}
