import type { Theme } from '../types/theme';

export const ubuntuTheme: Theme = {
  name: 'ubuntu',
  colors: {
    background: '#2c001e', // Aubergine
    foreground: '#f6f5f4',
    border: '#5c5c5c', // Warm Grey

    calendarBorder: '#5c5c5c',
    calendarHeader: '#E95420', // Orange
    calendarToday: '#E95420',
    calendarSelected: '#E95420',
    calendarDayWithTasks: '#77216F', // Aubergine light / Purple
    calendarDayOtherMonth: '#AEA79F',

    taskBorder: '#5c5c5c',
    taskHeader: '#E95420',
    taskCheckboxEmpty: '#AEA79F',
    taskCheckboxFilled: '#0E8420', // Green
    taskStateTodo: '#f6f5f4',
    taskStateCompleted: '#AEA79F',
    taskStateDelegated: '#77216F',
    taskStateDelayed: '#C7162B', // Red
    taskIndent: '#5c5c5c',

    timelineBorder: '#5c5c5c',
    timelineHeader: '#E95420',
    timelineTimestamp: '#AEA79F',
    timelineEventCreated: '#E95420',
    timelineEventStarted: '#F99B11',
    timelineEventCompleted: '#0E8420',
    timelineEventDelegated: '#77216F',
    timelineEventDelayed: '#C7162B',

    separator: '#5c5c5c',
    keyboardHint: '#AEA79F',
    helpDialogBorder: '#E95420',
    focusIndicator: '#E95420',

    modalOverlay: '#1a0012',
    modalBackground: '#300a24',
  },
};
