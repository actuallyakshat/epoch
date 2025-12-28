import type { Theme } from '../types/theme';

// X (Twitter) Dark theme - Official X/Twitter dark mode colors (Dim mode)
export const xTheme: Theme = {
  name: 'x',
  colors: {
    background: '#15202b', // X Dim background
    foreground: '#f7f9f9',
    border: '#38444d',

    calendarBorder: '#38444d',
    calendarHeader: '#1d9bf0', // X Blue
    calendarToday: '#1d9bf0',
    calendarSelected: '#1d9bf0',
    calendarDayWithTasks: '#00ba7c', // Green
    calendarDayOtherMonth: '#8b98a5', // Secondary text

    taskBorder: '#38444d',
    taskHeader: '#1d9bf0',
    taskCheckboxEmpty: '#8b98a5',
    taskCheckboxFilled: '#00ba7c',
    taskStateTodo: '#f7f9f9',
    taskStateCompleted: '#8b98a5',
    taskStateDelegated: '#7856ff', // Purple
    taskStateDelayed: '#f4212e', // Red
    taskIndent: '#38444d',

    timelineBorder: '#38444d',
    timelineHeader: '#1d9bf0',
    timelineTimestamp: '#8b98a5',
    timelineEventCreated: '#1d9bf0',
    timelineEventStarted: '#ffad1f', // Yellow
    timelineEventCompleted: '#00ba7c',
    timelineEventDelegated: '#7856ff',
    timelineEventDelayed: '#f4212e',

    separator: '#38444d',
    keyboardHint: '#8b98a5',
    helpDialogBorder: '#1d9bf0',
    focusIndicator: '#1d9bf0',

    modalOverlay: '#5b708366', // X dim overlay style
    modalBackground: '#1e2d3d',
  },
};
