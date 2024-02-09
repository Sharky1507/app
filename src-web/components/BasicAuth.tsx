import { useUpdateHttpRequest } from '../hooks/useUpdateHttpRequest';
import type { HttpRequest } from '../lib/models';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

interface Props {
  requestId: string;
  authentication: HttpRequest['authentication'];
}

export function BasicAuth({ requestId, authentication }: Props) {
  const updateRequest = useUpdateHttpRequest(requestId);

  return (
    <VStack className="my-2" space={2}>
      <Input
        useTemplating
        autocompleteVariables
        forceUpdateKey={requestId}
        placeholder="username"
        label="Username"
        name="username"
        size="sm"
        defaultValue={`${authentication.username}`}
        onChange={(username: string) => {
          updateRequest.mutate((r) => ({
            ...r,
            authentication: { password: r.authentication.password, username },
          }));
        }}
      />
      <Input
        useTemplating
        autocompleteVariables
        forceUpdateKey={requestId}
        placeholder="password"
        label="Password"
        name="password"
        size="sm"
        type="password"
        defaultValue={`${authentication.password}`}
        onChange={(password: string) => {
          updateRequest.mutate((r) => ({
            ...r,
            authentication: { username: r.authentication.username, password },
          }));
        }}
      />
    </VStack>
  );
}
