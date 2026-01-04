import type { Theme } from '../types/theme';

export const terminalTheme: Theme = {
  name: 'terminal',
  colors: {
    // defaults rely on terminal settings

    border: 'gray',

    calendarBorder: 'gray',
    calendarHeader: 'blue',
    calendarToday: 'green',
    calendarSelected: 'magenta',
    calendarDayWithTasks: 'yellow',
    calendarDayOtherMonth: 'gray',

    taskBorder: 'gray',
    taskHeader: 'blue',
    taskCheckboxEmpty: 'gray',
    taskCheckboxFilled: 'green',
    taskStateTodo: undefined, // default
    taskStateCompleted: 'green',
    taskStateDelegated: 'magenta',
    taskStateDelayed: 'red',
    taskIndent: 'gray',

    timelineBorder: 'gray',
    timelineHeader: 'blue',
    timelineTimestamp: 'gray',
    timelineEventCreated: 'cyan',
    timelineEventStarted: 'yellow',
    timelineEventCompleted: 'green',
    timelineEventDelegated: 'magenta',
    timelineEventDelayed: 'red',

    separator: 'gray',
    keyboardHint: 'gray',
    helpDialogBorder: 'blue',
    focusIndicator: 'cyan',

    // Modal colors follow terminal defaults
    modalOverlay: undefined,
    modalBackground: undefined,
  },
};
