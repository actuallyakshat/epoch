import type { Theme } from '../types/theme';

export const githubDarkTheme: Theme = {
  name: 'github-dark',
  colors: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    border: '#30363d',

    calendarBorder: '#30363d',
    calendarHeader: '#58a6ff',
    calendarToday: '#1f6feb',
    calendarSelected: '#1f6feb',
    calendarDayWithTasks: '#238636',
    calendarDayOtherMonth: '#484f58',

    taskBorder: '#30363d',
    taskHeader: '#58a6ff',
    taskCheckboxEmpty: '#484f58',
    taskCheckboxFilled: '#3fb950',
    taskStateTodo: '#c9d1d9',
    taskStateCompleted: '#8b949e',
    taskStateDelegated: '#a371f7',
    taskStateDelayed: '#d29922',
    taskIndent: '#484f58',

    timelineBorder: '#30363d',
    timelineHeader: '#58a6ff',
    timelineTimestamp: '#8b949e',
    timelineEventCreated: '#58a6ff',
    timelineEventStarted: '#d29922',
    timelineEventCompleted: '#3fb950',
    timelineEventDelegated: '#a371f7',
    timelineEventDelayed: '#f85149',

    separator: '#30363d',
    keyboardHint: '#8b949e',
    helpDialogBorder: '#58a6ff',
    focusIndicator: '#58a6ff',

    modalOverlay: '#0d1117',
    modalBackground: '#161b22',
  },
};
