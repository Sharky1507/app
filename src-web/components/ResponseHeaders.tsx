import classnames from 'classnames';
import type { HttpResponse } from '../lib/models';
import { HStack } from './core/Stacks';

interface Props {
  headers: HttpResponse['headers'];
}

export function ResponseHeaders({ headers }: Props) {
  return (
    <dl className="font-mono text-xs table-fixed w-full">
      {headers.map((h, i) => {
        return (
          <HStack
            space={3}
            key={i}
            className={classnames(i > 0 && 'border-t border-highlightSecondary', 'py-1')}
          >
            <dd className="w-1/3 text-violet-600 select-text cursor-text">{h.name}</dd>
            <dt className="w-2/3 text-blue-600 select-text cursor-text break-all">{h.value}</dt>
          </HStack>
        );
      })}
    </dl>
  );
}
