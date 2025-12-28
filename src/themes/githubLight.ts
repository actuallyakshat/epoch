import type { Theme } from '../types/theme';

// GitHub Light theme - official GitHub light mode colors
export const githubLightTheme: Theme = {
  name: 'github-light',
  colors: {
    background: '#ffffff',
    foreground: '#24292f',
    border: '#d0d7de',

    calendarBorder: '#d0d7de',
    calendarHeader: '#0969da', // Blue
    calendarToday: '#0969da',
    calendarSelected: '#0969da',
    calendarDayWithTasks: '#1a7f37', // Green
    calendarDayOtherMonth: '#8c959f',

    taskBorder: '#d0d7de',
    taskHeader: '#0969da',
    taskCheckboxEmpty: '#8c959f',
    taskCheckboxFilled: '#1a7f37',
    taskStateTodo: '#24292f',
    taskStateCompleted: '#8c959f',
    taskStateDelegated: '#8250df', // Purple
    taskStateDelayed: '#bf8700', // Yellow/Orange

    taskIndent: '#d0d7de',

    timelineBorder: '#d0d7de',
    timelineHeader: '#0969da',
    timelineTimestamp: '#8c959f',
    timelineEventCreated: '#0969da',
    timelineEventStarted: '#bf8700',
    timelineEventCompleted: '#1a7f37',
    timelineEventDelegated: '#8250df',
    timelineEventDelayed: '#cf222e', // Red

    separator: '#d0d7de',
    keyboardHint: '#656d76',
    helpDialogBorder: '#0969da',
    focusIndicator: '#0969da',

    modalOverlay: '#00000033',
    modalBackground: '#f6f8fa',
  },
};
