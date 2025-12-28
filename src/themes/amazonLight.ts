import type { Theme } from '../types/theme';

// Amazon Light theme - Official Amazon light mode colors
export const amazonLightTheme: Theme = {
  name: 'amazon-light',
  colors: {
    background: '#ffffff',
    foreground: '#0f1111',
    border: '#ddd',

    calendarBorder: '#ddd',
    calendarHeader: '#ff9900', // Amazon Orange
    calendarToday: '#ff9900',
    calendarSelected: '#ff9900',
    calendarDayWithTasks: '#ff9900',
    calendarDayOtherMonth: '#565959',

    taskBorder: '#ddd',
    taskHeader: '#ff9900',
    taskCheckboxEmpty: '#565959',
    taskCheckboxFilled: '#ff9900',
    taskStateTodo: '#0f1111',
    taskStateCompleted: '#565959',
    taskStateDelegated: '#146eb4', // Amazon Prime blue
    taskStateDelayed: '#b12704', // Amazon red/warning
    taskIndent: '#ddd',

    timelineBorder: '#ddd',
    timelineHeader: '#ff9900',
    timelineTimestamp: '#565959',
    timelineEventCreated: '#ff9900',
    timelineEventStarted: '#ff9900',
    timelineEventCompleted: '#007600', // Amazon green (success)
    timelineEventDelegated: '#146eb4',
    timelineEventDelayed: '#b12704',

    separator: '#ddd',
    keyboardHint: '#565959',
    helpDialogBorder: '#ff9900',
    focusIndicator: '#ff9900',

    modalOverlay: '#00000033',
    modalBackground: '#f7f8f8',
  },
};
