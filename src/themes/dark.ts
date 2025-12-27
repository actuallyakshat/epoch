import type { Theme } from '../types/theme';

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',

    calendarBorder: '#3e3e3e',
    calendarHeader: '#569cd6',
    calendarToday: '#4ec9b0',
    calendarSelected: '#c586c0',
    calendarDayWithTasks: '#dcdcaa',
    calendarDayOtherMonth: '#6e6e6e',

    taskBorder: '#3e3e3e',
    taskHeader: '#569cd6',
    taskCheckboxEmpty: '#6e6e6e',
    taskCheckboxFilled: '#4ec9b0',
    taskStateTodo: '#d4d4d4',
    taskStateCompleted: '#4ec9b0',
    taskStateDelegated: '#dcdcaa',
    taskStateDelayed: '#f48771',
    taskIndent: '#6e6e6e',

    timelineBorder: '#3e3e3e',
    timelineHeader: '#569cd6',
    timelineTimestamp: '#6e6e6e',
    timelineEventCreated: '#9cdcfe',
    timelineEventStarted: '#dcdcaa',
    timelineEventCompleted: '#4ec9b0',
    timelineEventDelegated: '#c586c0',
    timelineEventDelayed: '#f48771',

    separator: '#3e3e3e',
    keyboardHint: '#6e6e6e',
    helpDialogBorder: '#569cd6',
    focusIndicator: '#c586c0',
  },
};
