import { Color } from '../color';
import type { YaakTheme } from '../window';

const githubDark: YaakTheme = {
  id: 'github-dark',
  name: 'GitHub',
  background: new Color('#0d1218', 'dark'),
  backgroundHighlight: new Color('#171c23', 'dark'),
  backgroundHighlightSecondary: new Color('#1c2127', 'dark'),
  foreground: new Color('#dce3eb', 'dark'),
  foregroundSubtle: new Color('#88919b', 'dark'),
  foregroundSubtler: new Color('#6b727d', 'dark'),
  colors: {
    primary: new Color('#a579ef', 'dark').lift(0.1),
    secondary: new Color('#6b727d', 'dark').lift(0.1),
    info: new Color('#458def', 'dark').lift(0.1),
    success: new Color('#3eb24f', 'dark').lift(0.1),
    notice: new Color('#dca132', 'dark').lift(0.1),
    warning: new Color('#ec7934', 'dark').lift(0.1),
    danger: new Color('#ee5049', 'dark').lift(0.1),
  },
  components: {
    button: {
      colors: {
        primary: new Color('#a579ef', 'dark'),
        secondary: new Color('#6b727d', 'dark'),
        info: new Color('#458def', 'dark'),
        success: new Color('#3eb24f', 'dark'),
        notice: new Color('#dca132', 'dark'),
        warning: new Color('#ec7934', 'dark'),
        danger: new Color('#ee5049', 'dark'),
      },
    },
  },
};

export const githubLight: YaakTheme = {
  id: 'github-light',
  name: 'GitHub',
  background: new Color('#ffffff', 'light'),
  backgroundHighlight: new Color('hsl(210,15%,92%)', 'light'),
  backgroundHighlightSecondary: new Color('hsl(210,29%,94%)', 'light'),
  foreground: new Color('#1f2328', 'light'),
  foregroundSubtle: new Color('#636c76', 'light'),
  foregroundSubtler: new Color('#828d94', 'light'),
  colors: {
    primary: new Color('#8250df', 'light'),
    secondary: new Color('#6e7781', 'light'),
    info: new Color('hsl(212,92%,48%)', 'light'),
    success: new Color('hsl(137,66%,32%)', 'light'),
    notice: new Color('hsl(40,100%,40%)', 'light'),
    warning: new Color('hsl(24,100%,44%)', 'light'),
    danger: new Color('#d1242f', 'light'),
  },
};

export const github = [githubDark, githubLight];
