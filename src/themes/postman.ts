import type { Theme } from '../types/theme';

export const postmanTheme: Theme = {
  name: 'postman',
  colors: {
    background: '#212121',
    foreground: '#ededed',
    border: '#333333',

    calendarBorder: '#333333',
    calendarHeader: '#EF5B25', // Postman Orange
    calendarToday: '#EF5B25',
    calendarSelected: '#EF5B25',
    calendarDayWithTasks: '#00B8D9', // Accent Blueish
    calendarDayOtherMonth: '#666666',

    taskBorder: '#333333',
    taskHeader: '#EF5B25',
    taskCheckboxEmpty: '#666666',
    taskCheckboxFilled: '#00B8D9',
    taskStateTodo: '#ededed',
    taskStateCompleted: '#666666',
    taskStateDelegated: '#FF9900',
    taskStateDelayed: '#FF3333',
    taskIndent: '#333333',

    timelineBorder: '#333333',
    timelineHeader: '#EF5B25',
    timelineTimestamp: '#666666',
    timelineEventCreated: '#EF5B25',
    timelineEventStarted: '#FF9900',
    timelineEventCompleted: '#00B8D9',
    timelineEventDelegated: '#6554C0', // Purple
    timelineEventDelayed: '#FF3333',

    separator: '#333333',
    keyboardHint: '#666666',
    helpDialogBorder: '#EF5B25',
    focusIndicator: '#EF5B25',

    modalOverlay: '#121212',
    modalBackground: '#212121',
  },
};
