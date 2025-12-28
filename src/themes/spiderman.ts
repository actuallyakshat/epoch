import type { Theme } from '../types/theme';

export const spidermanTheme: Theme = {
  name: 'spiderman',
  colors: {
    background: '#101820', // Very dark blueish black
    foreground: '#e0e0e0',
    border: '#2B3784', // Spidey Blue

    calendarBorder: '#2B3784',
    calendarHeader: '#DF1F2D', // Spidey Red
    calendarToday: '#DF1F2D',
    calendarSelected: '#DF1F2D',
    calendarDayWithTasks: '#DF1F2D',
    calendarDayOtherMonth: '#4a4a4a',

    taskBorder: '#2B3784',
    taskHeader: '#DF1F2D',
    taskCheckboxEmpty: '#2B3784',
    taskCheckboxFilled: '#DF1F2D',
    taskStateTodo: '#e0e0e0',
    taskStateCompleted: '#4a4a4a',
    taskStateDelegated: '#2B3784',
    taskStateDelayed: '#a71814',
    taskIndent: '#2B3784',

    timelineBorder: '#2B3784',
    timelineHeader: '#DF1F2D',
    timelineTimestamp: '#4a4a4a',
    timelineEventCreated: '#DF1F2D',
    timelineEventStarted: '#DF1F2D',
    timelineEventCompleted: '#DF1F2D',
    timelineEventDelegated: '#2B3784',
    timelineEventDelayed: '#a71814',

    separator: '#2B3784',
    keyboardHint: '#4a4a4a',
    helpDialogBorder: '#DF1F2D',
    focusIndicator: '#DF1F2D',

    modalOverlay: '#000000cc',
    modalBackground: '#1d2a38',
  },
};
