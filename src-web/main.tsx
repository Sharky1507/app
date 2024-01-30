import { invoke } from '@tauri-apps/api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { attachConsole } from 'tauri-plugin-log-api';
import { App } from './components/App';
import { maybeRestorePathname } from './lib/persistPathname';
import './main.css';
import { getSettings } from './lib/store';
import type { Appearance } from './lib/theme/window';
import { setAppearanceOnDocument } from './lib/theme/window';
import { appWindow } from '@tauri-apps/api/window';
import { type } from '@tauri-apps/api/os';

try {
  const services: any = await invoke('grpc_reflect', { endpoint: 'http://localhost:50051' });
  console.log('SERVICES', services);
  const response = await invoke('grpc_call_unary', {
    endpoint: 'http://localhost:50051',
    service: services[0].name,
    method: services[0].methods[0].name,
    message: '{"name": "Greg"}',
  });
  console.log('RESPONSE', response);
} catch (err) {
  console.log('ERROR', err);
}

// Hide decorations here because it doesn't work in Rust for some reason (bug?)
const osType = await type();
if (osType !== 'Darwin') {
  await appWindow.setDecorations(false);
}

await attachConsole();
await maybeRestorePathname();

const settings = await getSettings();
setAppearanceOnDocument(settings.appearance as Appearance);

document.addEventListener('keydown', (e) => {
  // Don't go back in history on backspace
  if (e.key === 'Backspace') e.preventDefault();
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
