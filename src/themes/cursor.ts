import type { Theme } from '../types/theme';

// Cursor Dark theme - Based on Cursor's Anysphere Dark / VS Code Dark Plus
export const cursorTheme: Theme = {
  name: 'cursor',
  colors: {
    background: '#1e1e1e', // VS Code default dark background
    foreground: '#cccccc',
    border: '#3c3c3c',

    calendarBorder: '#3c3c3c',
    calendarHeader: '#569cd6', // VS Code blue
    calendarToday: '#569cd6',
    calendarSelected: '#569cd6',
    calendarDayWithTasks: '#4ec9b0', // Teal
    calendarDayOtherMonth: '#6e7681',

    taskBorder: '#3c3c3c',
    taskHeader: '#569cd6',
    taskCheckboxEmpty: '#6e7681',
    taskCheckboxFilled: '#4ec9b0',
    taskStateTodo: '#cccccc',
    taskStateCompleted: '#6e7681',
    taskStateDelegated: '#c586c0', // Purple
    taskStateDelayed: '#ce9178', // Orange
    taskIndent: '#3c3c3c',

    timelineBorder: '#3c3c3c',
    timelineHeader: '#569cd6',
    timelineTimestamp: '#6e7681',
    timelineEventCreated: '#569cd6',
    timelineEventStarted: '#dcdcaa', // Yellow
    timelineEventCompleted: '#4ec9b0',
    timelineEventDelegated: '#c586c0',
    timelineEventDelayed: '#f14c4c', // Red

    separator: '#3c3c3c',
    keyboardHint: '#6e7681',
    helpDialogBorder: '#569cd6',
    focusIndicator: '#569cd6',

    modalOverlay: '#0d0d0d',
    modalBackground: '#252526', // VS Code sidebar
  },
};
