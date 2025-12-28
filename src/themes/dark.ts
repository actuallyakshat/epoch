import type { Theme } from '../types/theme';

// Monochrome dark theme with amber accents
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1a1a1a',
    foreground: '#e5e5e5',
    border: '#404040',

    calendarBorder: '#404040',
    calendarHeader: '#f59e0b', // Amber
    calendarToday: '#f59e0b', // Amber
    calendarSelected: '#fbbf24', // Amber light
    calendarDayWithTasks: '#d97706', // Amber dark
    calendarDayOtherMonth: '#525252',

    taskBorder: '#404040',
    taskHeader: '#f59e0b', // Amber
    taskCheckboxEmpty: '#525252',
    taskCheckboxFilled: '#f59e0b', // Amber
    taskStateTodo: '#e5e5e5',
    taskStateCompleted: '#737373',
    taskStateDelegated: '#a3a3a3',
    taskStateDelayed: '#fbbf24', // Amber light for attention
    taskIndent: '#525252',

    timelineBorder: '#404040',
    timelineHeader: '#f59e0b', // Amber
    timelineTimestamp: '#737373',
    timelineEventCreated: '#e5e5e5',
    timelineEventStarted: '#fbbf24', // Amber light
    timelineEventCompleted: '#a3a3a3',
    timelineEventDelegated: '#8a8a8a',
    timelineEventDelayed: '#f59e0b', // Amber

    separator: '#404040',
    keyboardHint: '#737373',
    helpDialogBorder: '#f59e0b', // Amber
    focusIndicator: '#f59e0b', // Amber

    modalOverlay: '#0a0a0a',
    modalBackground: '#1a1a1a',
  },
};
