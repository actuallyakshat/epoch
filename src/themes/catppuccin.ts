import type { Theme } from '../types/theme';

export const catppuccinTheme: Theme = {
  name: 'catppuccin',
  colors: {
    background: '#1e1e2e',
    foreground: '#cdd6f4',
    border: '#45475a',

    calendarBorder: '#45475a',
    calendarHeader: '#89b4fa', // Blue
    calendarToday: '#cba6f7', // Mauve
    calendarSelected: '#cba6f7',
    calendarDayWithTasks: '#a6e3a1', // Green
    calendarDayOtherMonth: '#585b70', // Surface 2

    taskBorder: '#45475a',
    taskHeader: '#89b4fa',
    taskCheckboxEmpty: '#585b70',
    taskCheckboxFilled: '#a6e3a1',
    taskStateTodo: '#cdd6f4',
    taskStateCompleted: '#a6adc8', // Subtext 0
    taskStateDelegated: '#f5c2e7', // Pink
    taskStateDelayed: '#fab387', // Peach
    taskIndent: '#585b70',

    timelineBorder: '#45475a',
    timelineHeader: '#89b4fa',
    timelineTimestamp: '#a6adc8',
    timelineEventCreated: '#89b4fa',
    timelineEventStarted: '#fab387',
    timelineEventCompleted: '#a6e3a1',
    timelineEventDelegated: '#f5c2e7',
    timelineEventDelayed: '#f38ba8', // Red

    separator: '#45475a',
    keyboardHint: '#a6adc8',
    helpDialogBorder: '#cba6f7',
    focusIndicator: '#cba6f7',

    modalOverlay: '#181825', // Mantle
    modalBackground: '#1e1e2e',
  },
};
