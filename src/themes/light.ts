import type { Theme } from '../types/theme';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Hex colors work with Ink's Text backgroundColor (via chalk)
    background: '#f5f5f5',
    foreground: '#1a1a1a',
    border: '#888888',

    calendarBorder: '#888888',
    calendarHeader: '#0066cc',
    calendarToday: '#00aa77',
    calendarSelected: '#9933cc',
    calendarDayWithTasks: '#cc6600',
    calendarDayOtherMonth: '#888888',

    taskBorder: '#888888',
    taskHeader: '#0066cc',
    taskCheckboxEmpty: '#888888',
    taskCheckboxFilled: '#00aa77',
    taskStateTodo: '#1a1a1a',
    taskStateCompleted: '#00aa77',
    taskStateDelegated: '#cc6600',
    taskStateDelayed: '#cc3333',
    taskIndent: '#888888',

    timelineBorder: '#888888',
    timelineHeader: '#0066cc',
    timelineTimestamp: '#666666',
    timelineEventCreated: '#0066cc',
    timelineEventStarted: '#cc6600',
    timelineEventCompleted: '#00aa77',
    timelineEventDelegated: '#9933cc',
    timelineEventDelayed: '#cc3333',

    separator: '#888888',
    keyboardHint: '#666666',
    helpDialogBorder: '#0066cc',
    focusIndicator: '#9933cc',

    modalOverlay: '#e0e0e0',
    modalBackground: '#f5f5f5',
  },
};
