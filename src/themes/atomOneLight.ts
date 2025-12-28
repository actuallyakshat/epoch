import type { Theme } from '../types/theme';

// Atom One Light theme - official Atom One Light palette
export const atomOneLightTheme: Theme = {
  name: 'atom-light',
  colors: {
    background: '#fafafa',
    foreground: '#383a42',
    border: '#a0a1a7',

    calendarBorder: '#a0a1a7',
    calendarHeader: '#4078f2', // Blue
    calendarToday: '#a626a4', // Purple
    calendarSelected: '#a626a4',
    calendarDayWithTasks: '#50a14f', // Green
    calendarDayOtherMonth: '#a0a1a7',

    taskBorder: '#a0a1a7',
    taskHeader: '#4078f2',
    taskCheckboxEmpty: '#a0a1a7',
    taskCheckboxFilled: '#50a14f',
    taskStateTodo: '#383a42',
    taskStateCompleted: '#a0a1a7',
    taskStateDelegated: '#a626a4',
    taskStateDelayed: '#c18401', // Yellow/Orange
    taskIndent: '#d0d0d0',

    timelineBorder: '#a0a1a7',
    timelineHeader: '#4078f2',
    timelineTimestamp: '#a0a1a7',
    timelineEventCreated: '#4078f2',
    timelineEventStarted: '#c18401',
    timelineEventCompleted: '#50a14f',
    timelineEventDelegated: '#a626a4',
    timelineEventDelayed: '#e45649', // Red

    separator: '#a0a1a7',
    keyboardHint: '#a0a1a7',
    helpDialogBorder: '#4078f2',
    focusIndicator: '#0184bc', // Cyan

    modalOverlay: '#e8e8e8',
    modalBackground: '#fafafa',
  },
};
