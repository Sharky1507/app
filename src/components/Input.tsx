import { InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import { VStack } from './Stacks';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
}

export function Input({ label, labelClassName, hideLabel, className, name, ...props }: Props) {
  const id = `input-${name}`;
  return (
    <VStack>
      <label
        htmlFor={name}
        className={classnames(labelClassName, 'font-semibold text-sm uppercase text-gray-700', {
          'sr-only': hideLabel,
        })}
      >
        {label}
      </label>
      <input
        id={id}
        className={classnames(
          className,
          'border-2 border-gray-100 bg-gray-50 h-10 pl-5 pr-2 rounded-lg text-sm focus:outline-none',
        )}
        {...props}
      />
    </VStack>
  );
}
