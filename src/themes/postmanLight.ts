import type { Theme } from '../types/theme';

// Postman Light theme - Official Postman Light mode colors
export const postmanLightTheme: Theme = {
  name: 'postman-light',
  colors: {
    background: '#ffffff',
    foreground: '#212121',
    border: '#e0e0e0',

    calendarBorder: '#e0e0e0',
    calendarHeader: '#ff6c37', // Postman Orange
    calendarToday: '#ff6c37',
    calendarSelected: '#ff6c37',
    calendarDayWithTasks: '#00a86b', // Green
    calendarDayOtherMonth: '#9e9e9e',

    taskBorder: '#e0e0e0',
    taskHeader: '#ff6c37',
    taskCheckboxEmpty: '#9e9e9e',
    taskCheckboxFilled: '#00a86b',
    taskStateTodo: '#212121',
    taskStateCompleted: '#9e9e9e',
    taskStateDelegated: '#6554c0', // Purple
    taskStateDelayed: '#ffab00', // Amber
    taskIndent: '#e0e0e0',

    timelineBorder: '#e0e0e0',
    timelineHeader: '#ff6c37',
    timelineTimestamp: '#9e9e9e',
    timelineEventCreated: '#ff6c37',
    timelineEventStarted: '#ffab00',
    timelineEventCompleted: '#00a86b',
    timelineEventDelegated: '#6554c0',
    timelineEventDelayed: '#ff3333', // Red

    separator: '#e0e0e0',
    keyboardHint: '#9e9e9e',
    helpDialogBorder: '#ff6c37',
    focusIndicator: '#ff6c37',

    modalOverlay: '#f5f5f5',
    modalBackground: '#ffffff',
  },
};
