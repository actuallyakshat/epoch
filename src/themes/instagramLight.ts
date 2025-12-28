import type { Theme } from '../types/theme';

// Instagram Light theme - Official Instagram light mode colors
export const instagramLightTheme: Theme = {
  name: 'instagram-light',
  colors: {
    background: '#ffffff',
    foreground: '#262626',
    border: '#dbdbdb',

    calendarBorder: '#dbdbdb',
    calendarHeader: '#e1306c', // Instagram pink
    calendarToday: '#0095f6', // Instagram blue
    calendarSelected: '#0095f6',
    calendarDayWithTasks: '#0095f6',
    calendarDayOtherMonth: '#8e8e8e',

    taskBorder: '#dbdbdb',
    taskHeader: '#e1306c',
    taskCheckboxEmpty: '#8e8e8e',
    taskCheckboxFilled: '#0095f6',
    taskStateTodo: '#262626',
    taskStateCompleted: '#8e8e8e',
    taskStateDelegated: '#833ab4', // Purple gradient
    taskStateDelayed: '#fd1d1d', // Red
    taskIndent: '#dbdbdb',

    timelineBorder: '#dbdbdb',
    timelineHeader: '#e1306c',
    timelineTimestamp: '#8e8e8e',
    timelineEventCreated: '#0095f6',
    timelineEventStarted: '#f56040', // Orange
    timelineEventCompleted: '#0095f6',
    timelineEventDelegated: '#833ab4',
    timelineEventDelayed: '#fd1d1d',

    separator: '#dbdbdb',
    keyboardHint: '#8e8e8e',
    helpDialogBorder: '#e1306c',
    focusIndicator: '#e1306c',

    modalOverlay: '#00000066',
    modalBackground: '#ffffff',
  },
};
