import type { Theme } from '../types/theme';

export const atomOneDarkTheme: Theme = {
  name: 'atom',
  colors: {
    background: '#282c34',
    foreground: '#abb2bf',
    border: '#4b5263',

    calendarBorder: '#4b5263',
    calendarHeader: '#61afef', // Blue
    calendarToday: '#c678dd', // Purple
    calendarSelected: '#c678dd',
    calendarDayWithTasks: '#98c379', // Green
    calendarDayOtherMonth: '#5c6370',

    taskBorder: '#4b5263',
    taskHeader: '#61afef',
    taskCheckboxEmpty: '#5c6370',
    taskCheckboxFilled: '#98c379',
    taskStateTodo: '#abb2bf',
    taskStateCompleted: '#5c6370',
    taskStateDelegated: '#c678dd',
    taskStateDelayed: '#e5c07b', // Yellow
    taskIndent: '#5c6370',

    timelineBorder: '#4b5263',
    timelineHeader: '#61afef',
    timelineTimestamp: '#5c6370',
    timelineEventCreated: '#61afef',
    timelineEventStarted: '#e5c07b',
    timelineEventCompleted: '#98c379',
    timelineEventDelegated: '#c678dd',
    timelineEventDelayed: '#e06c75', // Red

    separator: '#4b5263',
    keyboardHint: '#5c6370',
    helpDialogBorder: '#61afef',
    focusIndicator: '#56b6c2', // Cyan

    modalOverlay: '#21252b',
    modalBackground: '#282c34',
  },
};
