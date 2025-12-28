import type { Theme } from '../types/theme';

export const batmanTheme: Theme = {
  name: 'batman',
  colors: {
    background: '#000000',
    foreground: '#d6d6d6',
    border: '#333333',

    calendarBorder: '#333333',
    calendarHeader: '#ffff00', // Bright Yellow
    calendarToday: '#ffff00',
    calendarSelected: '#ffff00',
    calendarDayWithTasks: '#ffff00',
    calendarDayOtherMonth: '#444444',

    taskBorder: '#333333',
    taskHeader: '#ffff00',
    taskCheckboxEmpty: '#444444',
    taskCheckboxFilled: '#ffff00',
    taskStateTodo: '#d6d6d6',
    taskStateCompleted: '#555555',
    taskStateDelegated: '#2a3c5f', // Dark Knight Blue
    taskStateDelayed: '#e6aa5f', // Goldish
    taskIndent: '#333333',

    timelineBorder: '#333333',
    timelineHeader: '#ffff00',
    timelineTimestamp: '#555555',
    timelineEventCreated: '#ffff00',
    timelineEventStarted: '#e6aa5f',
    timelineEventCompleted: '#ffff00',
    timelineEventDelegated: '#2a3c5f',
    timelineEventDelayed: '#8c541c',

    separator: '#333333',
    keyboardHint: '#444444',
    helpDialogBorder: '#ffff00',
    focusIndicator: '#ffff00',

    modalOverlay: '#00000099',
    modalBackground: '#1a1a1a',
  },
};
