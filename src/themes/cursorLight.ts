import type { Theme } from '../types/theme';

// Cursor Light theme - Light variant inspired by Cursor/VS Code Light+
export const cursorLightTheme: Theme = {
  name: 'cursor-light',
  colors: {
    background: '#ffffff',
    foreground: '#1e1e1e',
    border: '#e0e0e0',

    calendarBorder: '#e0e0e0',
    calendarHeader: '#0066b8', // VS Code Blue
    calendarToday: '#0066b8',
    calendarSelected: '#0066b8',
    calendarDayWithTasks: '#22863a', // Green
    calendarDayOtherMonth: '#a0a0a0',

    taskBorder: '#e0e0e0',
    taskHeader: '#0066b8',
    taskCheckboxEmpty: '#a0a0a0',
    taskCheckboxFilled: '#0066b8',
    taskStateTodo: '#1e1e1e',
    taskStateCompleted: '#a0a0a0',
    taskStateDelegated: '#6f42c1', // Purple
    taskStateDelayed: '#d29922', // Orange/Yellow
    taskIndent: '#e0e0e0',

    timelineBorder: '#e0e0e0',
    timelineHeader: '#0066b8',
    timelineTimestamp: '#a0a0a0',
    timelineEventCreated: '#0066b8',
    timelineEventStarted: '#d29922',
    timelineEventCompleted: '#22863a',
    timelineEventDelegated: '#6f42c1',
    timelineEventDelayed: '#cb2431', // Red

    separator: '#e0e0e0',
    keyboardHint: '#a0a0a0',
    helpDialogBorder: '#0066b8',
    focusIndicator: '#0066b8',

    modalOverlay: '#f3f3f3',
    modalBackground: '#ffffff',
  },
};
