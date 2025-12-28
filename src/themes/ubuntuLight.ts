import type { Theme } from '../types/theme';

// Ubuntu Light (Yaru Light) theme - Official Ubuntu/Yaru palette
export const ubuntuLightTheme: Theme = {
  name: 'ubuntu-light',
  colors: {
    background: '#fafafa',
    foreground: '#3d3d3d',
    border: '#cdcdcd',

    calendarBorder: '#cdcdcd',
    calendarHeader: '#e95420', // Ubuntu Orange
    calendarToday: '#e95420',
    calendarSelected: '#e95420',
    calendarDayWithTasks: '#77216f', // Ubuntu Aubergine
    calendarDayOtherMonth: '#929292',

    taskBorder: '#cdcdcd',
    taskHeader: '#e95420',
    taskCheckboxEmpty: '#929292',
    taskCheckboxFilled: '#0e8420', // Ubuntu Green
    taskStateTodo: '#3d3d3d',
    taskStateCompleted: '#929292',
    taskStateDelegated: '#77216f',
    taskStateDelayed: '#c7162b', // Ubuntu Red
    taskIndent: '#cdcdcd',

    timelineBorder: '#cdcdcd',
    timelineHeader: '#e95420',
    timelineTimestamp: '#929292',
    timelineEventCreated: '#e95420',
    timelineEventStarted: '#f99b11', // Light Orange
    timelineEventCompleted: '#0e8420',
    timelineEventDelegated: '#77216f',
    timelineEventDelayed: '#c7162b',

    separator: '#cdcdcd',
    keyboardHint: '#929292',
    helpDialogBorder: '#e95420',
    focusIndicator: '#e95420',

    modalOverlay: '#e8e8e8',
    modalBackground: '#ffffff',
  },
};
