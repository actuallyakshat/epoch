import type { Theme } from '../types/theme';

export const nordTheme: Theme = {
  name: 'nord',
  colors: {
    background: '#2e3440',
    foreground: '#d8dee9',
    border: '#3b4252',

    calendarBorder: '#3b4252',
    calendarHeader: '#88c0d0', // Frost Blue
    calendarToday: '#81a1c1', // Frost Blue darker
    calendarSelected: '#81a1c1',
    calendarDayWithTasks: '#a3be8c', // Green
    calendarDayOtherMonth: '#4c566a',

    taskBorder: '#3b4252',
    taskHeader: '#88c0d0',
    taskCheckboxEmpty: '#4c566a',
    taskCheckboxFilled: '#a3be8c',
    taskStateTodo: '#d8dee9',
    taskStateCompleted: '#4c566a',
    taskStateDelegated: '#b48ead', // Purple
    taskStateDelayed: '#d08770', // Orange
    taskIndent: '#4c566a',

    timelineBorder: '#3b4252',
    timelineHeader: '#88c0d0',
    timelineTimestamp: '#4c566a',
    timelineEventCreated: '#5e81ac', // Darkest Blue
    timelineEventStarted: '#ebcb8b', // Yellow
    timelineEventCompleted: '#a3be8c',
    timelineEventDelegated: '#b48ead',
    timelineEventDelayed: '#bf616a', // Red

    separator: '#3b4252',
    keyboardHint: '#4c566a',
    helpDialogBorder: '#88c0d0',
    focusIndicator: '#88c0d0',

    modalOverlay: '#242933',
    modalBackground: '#3b4252',
  },
};
