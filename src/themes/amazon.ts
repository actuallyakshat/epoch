import type { Theme } from '../types/theme';

export const amazonTheme: Theme = {
  name: 'amazon',
  colors: {
    background: '#131A22',
    foreground: '#ffffff',
    border: '#232f3e',

    calendarBorder: '#232f3e',
    calendarHeader: '#ff9900', // Amazon Orange
    calendarToday: '#ff9900',
    calendarSelected: '#ff9900',
    calendarDayWithTasks: '#ff9900',
    calendarDayOtherMonth: '#3a4553',

    taskBorder: '#232f3e',
    taskHeader: '#ff9900',
    taskCheckboxEmpty: '#3a4553',
    taskCheckboxFilled: '#ff9900',
    taskStateTodo: '#ffffff',
    taskStateCompleted: '#565959',
    taskStateDelegated: '#146eb4', // Amazon Prime blueish
    taskStateDelayed: '#ff9900',
    taskIndent: '#232f3e',

    timelineBorder: '#232f3e',
    timelineHeader: '#ff9900',
    timelineTimestamp: '#565959',
    timelineEventCreated: '#ff9900',
    timelineEventStarted: '#ff9900',
    timelineEventCompleted: '#ff9900',
    timelineEventDelegated: '#146eb4',
    timelineEventDelayed: '#cc0c39',

    separator: '#232f3e',
    keyboardHint: '#565959',
    helpDialogBorder: '#ff9900',
    focusIndicator: '#ff9900',

    modalOverlay: '#00000099',
    modalBackground: '#232f3e',
  },
};
