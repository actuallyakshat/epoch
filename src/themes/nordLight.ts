import type { Theme } from '../types/theme';

// Nord Light theme - official Nord palette (Snow Storm + adapted accents)
export const nordLightTheme: Theme = {
  name: 'nord-light',
  colors: {
    background: '#eceff4', // Nord6 (Snow Storm)
    foreground: '#2e3440', // Nord0 (Polar Night)
    border: '#d8dee9', // Nord4

    calendarBorder: '#d8dee9',
    calendarHeader: '#5e81ac', // Nord10 (Frost - darkest blue)
    calendarToday: '#5e81ac',
    calendarSelected: '#5e81ac',
    calendarDayWithTasks: '#a3be8c', // Nord14 (Aurora - green)
    calendarDayOtherMonth: '#4c566a', // Nord3

    taskBorder: '#d8dee9',
    taskHeader: '#5e81ac',
    taskCheckboxEmpty: '#4c566a',
    taskCheckboxFilled: '#a3be8c',
    taskStateTodo: '#2e3440',
    taskStateCompleted: '#4c566a',
    taskStateDelegated: '#b48ead', // Nord15 (Aurora - purple)
    taskStateDelayed: '#d08770', // Nord12 (Aurora - orange)
    taskIndent: '#d8dee9',

    timelineBorder: '#d8dee9',
    timelineHeader: '#5e81ac',
    timelineTimestamp: '#4c566a',
    timelineEventCreated: '#81a1c1', // Nord9 (Frost)
    timelineEventStarted: '#ebcb8b', // Nord13 (Aurora - yellow)
    timelineEventCompleted: '#a3be8c',
    timelineEventDelegated: '#b48ead',
    timelineEventDelayed: '#bf616a', // Nord11 (Aurora - red)

    separator: '#d8dee9',
    keyboardHint: '#4c566a',
    helpDialogBorder: '#5e81ac',
    focusIndicator: '#5e81ac',

    modalOverlay: '#e5e9f0', // Nord5
    modalBackground: '#eceff4',
  },
};
