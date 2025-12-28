import type { Theme } from '../types/theme';

// Apple Dark theme - Official macOS Dark Mode system colors
export const appleTheme: Theme = {
  name: 'apple',
  colors: {
    background: '#1c1c1e', // System Background Dark
    foreground: '#ffffff',
    border: '#38383a', // System Gray 5 Dark

    calendarBorder: '#38383a',
    calendarHeader: '#0a84ff', // System Blue Dark
    calendarToday: '#0a84ff',
    calendarSelected: '#0a84ff',
    calendarDayWithTasks: '#30d158', // System Green Dark
    calendarDayOtherMonth: '#636366', // System Gray 3 Dark

    taskBorder: '#38383a',
    taskHeader: '#0a84ff',
    taskCheckboxEmpty: '#636366',
    taskCheckboxFilled: '#30d158',
    taskStateTodo: '#ffffff',
    taskStateCompleted: '#8e8e93', // System Gray Dark
    taskStateDelegated: '#bf5af2', // System Purple Dark
    taskStateDelayed: '#ff9f0a', // System Orange Dark
    taskIndent: '#48484a', // System Gray 4 Dark

    timelineBorder: '#38383a',
    timelineHeader: '#0a84ff',
    timelineTimestamp: '#8e8e93',
    timelineEventCreated: '#0a84ff',
    timelineEventStarted: '#ff9f0a',
    timelineEventCompleted: '#30d158',
    timelineEventDelegated: '#bf5af2',
    timelineEventDelayed: '#ff453a', // System Red Dark

    separator: '#38383a',
    keyboardHint: '#8e8e93',
    helpDialogBorder: '#0a84ff',
    focusIndicator: '#0a84ff',

    modalOverlay: '#00000066',
    modalBackground: '#2c2c2e', // System Gray 5 Dark
  },
};
