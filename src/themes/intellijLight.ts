import type { Theme } from '../types/theme';

// IntelliJ Light theme - official IntelliJ IDEA Light palette
export const intellijLightTheme: Theme = {
  name: 'intellij-light',
  colors: {
    background: '#f7f7f7',
    foreground: '#000000',
    border: '#c4c4c4',

    calendarBorder: '#c4c4c4',
    calendarHeader: '#0033b3', // Keyword Blue
    calendarToday: '#0033b3',
    calendarSelected: '#0033b3',
    calendarDayWithTasks: '#067d17', // String Green
    calendarDayOtherMonth: '#8c8c8c',

    taskBorder: '#c4c4c4',
    taskHeader: '#0033b3',
    taskCheckboxEmpty: '#8c8c8c',
    taskCheckboxFilled: '#067d17',
    taskStateTodo: '#000000',
    taskStateCompleted: '#8c8c8c',
    taskStateDelegated: '#871094', // Purple
    taskStateDelayed: '#9e880d', // Yellow
    taskIndent: '#d4d4d4',

    timelineBorder: '#c4c4c4',
    timelineHeader: '#0033b3',
    timelineTimestamp: '#8c8c8c',
    timelineEventCreated: '#0033b3',
    timelineEventStarted: '#9e880d',
    timelineEventCompleted: '#067d17',
    timelineEventDelegated: '#871094',
    timelineEventDelayed: '#c00000', // Red

    separator: '#c4c4c4',
    keyboardHint: '#8c8c8c',
    helpDialogBorder: '#0033b3',
    focusIndicator: '#0033b3',

    modalOverlay: '#e8e8e8',
    modalBackground: '#ffffff',
  },
};
