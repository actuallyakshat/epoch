import type { Theme } from '../types/theme';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    foreground: '#333333',
    border: '#cccccc',

    calendarBorder: '#cccccc',
    calendarHeader: '#0066cc',
    calendarToday: '#00aa77',
    calendarSelected: '#9933cc',
    calendarDayWithTasks: '#ff9900',
    calendarDayOtherMonth: '#999999',

    taskBorder: '#cccccc',
    taskHeader: '#0066cc',
    taskCheckboxEmpty: '#999999',
    taskCheckboxFilled: '#00aa77',
    taskStateTodo: '#333333',
    taskStateCompleted: '#00aa77',
    taskStateDelegated: '#ff9900',
    taskStateDelayed: '#cc3333',
    taskIndent: '#cccccc',

    timelineBorder: '#cccccc',
    timelineHeader: '#0066cc',
    timelineTimestamp: '#999999',
    timelineEventCreated: '#0066cc',
    timelineEventStarted: '#ff9900',
    timelineEventCompleted: '#00aa77',
    timelineEventDelegated: '#9933cc',
    timelineEventDelayed: '#cc3333',

    separator: '#cccccc',
    keyboardHint: '#999999',
    helpDialogBorder: '#0066cc',
    focusIndicator: '#9933cc',

    modalOverlay: '#f0f0f0',
    modalBackground: '#ffffff',
  },
};
