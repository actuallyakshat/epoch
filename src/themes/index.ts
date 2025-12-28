import { darkTheme } from './dark';
import { lightTheme } from './light';
import { terminalTheme } from './terminal';
import { claudeTheme } from './claude';
import { githubDarkTheme } from './githubDark';
import { githubLightTheme } from './githubLight';
import { catppuccinTheme } from './catppuccin';
import { catppuccinLatteTheme } from './catppuccinLatte';
import { ubuntuTheme } from './ubuntu';
import { ubuntuLightTheme } from './ubuntuLight';
import { atomOneDarkTheme } from './atomOneDark';
import { atomOneLightTheme } from './atomOneLight';
import { intellijTheme } from './intellij';
import { intellijLightTheme } from './intellijLight';
import { nordTheme } from './nord';
import { nordLightTheme } from './nordLight';
import { postmanTheme } from './postman';
import { postmanLightTheme } from './postmanLight';
import { cursorTheme } from './cursor';
import { cursorLightTheme } from './cursorLight';
import { xTheme } from './x';
import { xLightTheme } from './xLight';
import { instagramTheme } from './instagram';
import { instagramLightTheme } from './instagramLight';
import { amazonTheme } from './amazon';
import { amazonLightTheme } from './amazonLight';
import { appleTheme } from './apple';
import { appleLightTheme } from './appleLight';
import { batmanTheme } from './batman';
import { spidermanTheme } from './spiderman';
import type { Theme } from '../types/theme';

// Light themes - white/bright backgrounds
export const lightThemes: Record<string, Theme> = {
  light: lightTheme,
  claude: claudeTheme,
  'apple-light': appleLightTheme,
  'github-light': githubLightTheme,
  'catppuccin-latte': catppuccinLatteTheme,
  'ubuntu-light': ubuntuLightTheme,
  'atom-light': atomOneLightTheme,
  'intellij-light': intellijLightTheme,
  'nord-light': nordLightTheme,
  'postman-light': postmanLightTheme,
  'cursor-light': cursorLightTheme,
  'x-light': xLightTheme,
  'instagram-light': instagramLightTheme,
  'amazon-light': amazonLightTheme,
};

// Dark themes - dark backgrounds
export const darkThemes: Record<string, Theme> = {
  dark: darkTheme,
  terminal: terminalTheme,
  apple: appleTheme,
  'github-dark': githubDarkTheme,
  catppuccin: catppuccinTheme,
  ubuntu: ubuntuTheme,
  atom: atomOneDarkTheme,
  intellij: intellijTheme,
  nord: nordTheme,
  postman: postmanTheme,
  cursor: cursorTheme,
  x: xTheme,
  instagram: instagramTheme,
  amazon: amazonTheme,
  batman: batmanTheme,
  spiderman: spidermanTheme,
};

// All themes combined
export const themes: Record<string, Theme> = {
  ...lightThemes,
  ...darkThemes,
};

export const getTheme = (name: string): Theme => {
  return themes[name] || themes.dark;
};

export const getThemeNames = (): string[] => {
  return Object.keys(themes);
};

export const getLightThemeNames = (): string[] => {
  return Object.keys(lightThemes);
};

export const getDarkThemeNames = (): string[] => {
  return Object.keys(darkThemes);
};

export type { Theme } from '../types/theme';
