import { darkTheme } from './dark';
import { lightTheme } from './light';
import { terminalTheme } from './terminal';
import { claudeCodeTheme } from './claudeCode';
import type { Theme } from '../types/theme';

export const themes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  terminal: terminalTheme,
  'claude-code': claudeCodeTheme,
};

export const getTheme = (name: string): Theme => {
  return themes[name] || themes.dark;
};

export const getThemeNames = (): string[] => {
  return Object.keys(themes);
};

export type { Theme } from '../types/theme';
