import type { Theme } from '../types/theme';

// Apple Light theme using official macOS Light Mode colors
export const appleLightTheme: Theme = {
  name: 'apple-light',
  colors: {
    background: '#ffffff', // System Background Light
    foreground: '#000000',
    border: '#d1d1d6', // System Gray 4 Light

    calendarBorder: '#d1d1d6',
    calendarHeader: '#007aff', // System Blue Light
    calendarToday: '#007aff',
    calendarSelected: '#007aff',
    calendarDayWithTasks: '#34c759', // System Green Light
    calendarDayOtherMonth: '#8e8e93', // System Gray Light

    taskBorder: '#d1d1d6',
    taskHeader: '#007aff',
    taskCheckboxEmpty: '#8e8e93',
    taskCheckboxFilled: '#34c759',
    taskStateTodo: '#000000',
    taskStateCompleted: '#8e8e93',
    taskStateDelegated: '#af52de', // System Purple Light
    taskStateDelayed: '#ff9500', // System Orange Light
    taskIndent: '#c7c7cc',

    timelineBorder: '#d1d1d6',
    timelineHeader: '#007aff',
    timelineTimestamp: '#8e8e93',
    timelineEventCreated: '#007aff',
    timelineEventStarted: '#ff9500',
    timelineEventCompleted: '#34c759',
    timelineEventDelegated: '#af52de',
    timelineEventDelayed: '#ff3b30', // System Red Light

    separator: '#d1d1d6',
    keyboardHint: '#8e8e93',
    helpDialogBorder: '#007aff',
    focusIndicator: '#007aff',

    modalOverlay: '#00000033',
    modalBackground: '#f2f2f7', // System Gray 6 Light
  },
};
