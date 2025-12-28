import type { Theme } from '../types/theme';

export const intellijTheme: Theme = {
  name: 'intellij',
  colors: {
    background: '#2b2b2b',
    foreground: '#a9b7c6',
    border: '#323232',

    calendarBorder: '#323232',
    calendarHeader: '#cc7832', // Orange (Keyword)
    calendarToday: '#3592c4', // Blue (Accent)
    calendarSelected: '#3592c4',
    calendarDayWithTasks: '#6a8759', // Green (String)
    calendarDayOtherMonth: '#606366',

    taskBorder: '#323232',
    taskHeader: '#cc7832',
    taskCheckboxEmpty: '#606366',
    taskCheckboxFilled: '#6a8759',
    taskStateTodo: '#a9b7c6',
    taskStateCompleted: '#606366',
    taskStateDelegated: '#9876aa', // Purple
    taskStateDelayed: '#ffc66d', // Yellow
    taskIndent: '#606366',

    timelineBorder: '#323232',
    timelineHeader: '#cc7832',
    timelineTimestamp: '#808080',
    timelineEventCreated: '#6897bb', // Light Blue
    timelineEventStarted: '#cc7832',
    timelineEventCompleted: '#6a8759',
    timelineEventDelegated: '#9876aa',
    timelineEventDelayed: '#cc7832',

    separator: '#323232',
    keyboardHint: '#808080',
    helpDialogBorder: '#3592c4',
    focusIndicator: '#3592c4',

    modalOverlay: '#1e1e1e',
    modalBackground: '#3c3f41',
  },
};
