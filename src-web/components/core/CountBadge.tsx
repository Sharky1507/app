import classnames from 'classnames';

interface Props {
  count: number;
  className?: string;
}

export function CountBadge({ count, className }: Props) {
  if (count === 0) return null;
  return (
    <div
      aria-hidden
      className={classnames(
        className,
        'opacity-70 border border-highlight text-3xs rounded mb-0.5 px-1 ml-1 h-4 font-mono',
      )}
    >
      {count}
    </div>
  );
}
