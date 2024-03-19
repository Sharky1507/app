import classNames from 'classnames';
import { Icon } from './Icon';
import { HStack } from './Stacks';

interface Props {
  checked: boolean;
  title: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  inputWrapperClassName?: string;
  indeterminate?: boolean;
  hideLabel?: boolean;
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  className,
  inputWrapperClassName,
  disabled,
  title,
  hideLabel,
}: Props) {
  return (
    <HStack
      as="label"
      space={2}
      alignItems="center"
      className={classNames(className, 'text-gray-900 text-sm', disabled && 'opacity-disabled')}
    >
      <div className={classNames(inputWrapperClassName, 'relative flex')}>
        <input
          aria-hidden
          className={classNames(
            'opacity-50 appearance-none w-4 h-4 flex-shrink-0 border border-[currentColor]',
            'rounded focus:border-focus focus:opacity-100 outline-none ring-0',
          )}
          type="checkbox"
          disabled={disabled}
          onChange={() => onChange(!checked)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size="sm" icon={indeterminate ? 'minus' : checked ? 'check' : 'empty'} />
        </div>
      </div>
      {/*<button*/}
      {/*  role="checkbox"*/}
      {/*  aria-checked={checked ? 'true' : 'false'}*/}
      {/*  disabled={disabled}*/}
      {/*  onClick={handleClick}*/}
      {/*  title={title}*/}
      {/*  className={classNames(*/}
      {/*    className,*/}
      {/*    'flex-shrink-0 w-4 h-4 border border-gray-200 rounded',*/}
      {/*    'focus:border-focus',*/}
      {/*    'disabled:opacity-disabled',*/}
      {/*    checked && 'bg-gray-200/10',*/}
      {/*    // Remove focus style*/}
      {/*    'outline-none',*/}
      {/*  )}*/}
      {/*>*/}
      {/*</button>*/}
      {!hideLabel && title}
    </HStack>
  );
}
