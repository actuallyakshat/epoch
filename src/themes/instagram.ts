import type { Theme } from '../types/theme';

export const instagramTheme: Theme = {
  name: 'instagram',
  colors: {
    background: '#121212',
    foreground: '#fafafa',
    border: '#262626',

    calendarBorder: '#262626',
    calendarHeader: '#e1306c', // Instagram gradient pinkish
    calendarToday: '#0095f6', // Instagram blue
    calendarSelected: '#0095f6',
    calendarDayWithTasks: '#0095f6',
    calendarDayOtherMonth: '#8e8e8e',

    taskBorder: '#262626',
    taskHeader: '#e1306c',
    taskCheckboxEmpty: '#8e8e8e',
    taskCheckboxFilled: '#0095f6',
    taskStateTodo: '#fafafa',
    taskStateCompleted: '#8e8e8e',
    taskStateDelegated: '#833ab4', // Purple from gradient
    taskStateDelayed: '#fca1cc', // Orange/Yellow ish
    taskIndent: '#262626',

    timelineBorder: '#262626',
    timelineHeader: '#e1306c',
    timelineTimestamp: '#8e8e8e',
    timelineEventCreated: '#0095f6',
    timelineEventStarted: '#f56040',
    timelineEventCompleted: '#0095f6',
    timelineEventDelegated: '#833ab4',
    timelineEventDelayed: '#fd1d1d',

    separator: '#262626',
    keyboardHint: '#8e8e8e',
    helpDialogBorder: '#e1306c',
    focusIndicator: '#e1306c',

    modalOverlay: '#00000080',
    modalBackground: '#262626',
  },
};
