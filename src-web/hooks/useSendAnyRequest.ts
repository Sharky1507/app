import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { save } from '@tauri-apps/api/dialog';
import slugify from 'slugify';
import { trackEvent } from '../lib/analytics';
import type { HttpResponse } from '../lib/models';
import { getHttpRequest } from '../lib/store';
import { useActiveCookieJar } from './useActiveCookieJar';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useAlert } from './useAlert';

export function useSendAnyRequest(options: { download?: boolean } = {}) {
  const environmentId = useActiveEnvironmentId();
  const alert = useAlert();
  const { activeCookieJar } = useActiveCookieJar();
  return useMutation<HttpResponse | null, string, string | null>({
    mutationFn: async (id) => {
      const request = await getHttpRequest(id);
      if (request == null) {
        return null;
      }

      let downloadDir: string | null = null;
      if (options.download) {
        downloadDir = await save({
          title: 'Select Download Destination',
          defaultPath: slugify(request.name, { lower: true, trim: true, strict: true }),
        });
        if (downloadDir == null) {
          return null;
        }
      }

      return invoke('cmd_send_http_request', {
        requestId: id,
        environmentId,
        downloadDir: downloadDir,
        cookieJarId: activeCookieJar?.id,
      });
    },
    onSettled: () => trackEvent('HttpRequest', 'Send'),
    onError: (err) => alert({ id: 'send-failed', title: 'Send Failed', body: err }),
  });
}
