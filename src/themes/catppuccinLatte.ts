import type { Theme } from '../types/theme';

// Catppuccin Latte (Light variant) - official Catppuccin palette
export const catppuccinLatteTheme: Theme = {
  name: 'catppuccin-latte',
  colors: {
    background: '#eff1f5', // Base
    foreground: '#4c4f69', // Text
    border: '#ccd0da', // Surface 0

    calendarBorder: '#ccd0da',
    calendarHeader: '#1e66f5', // Blue
    calendarToday: '#8839ef', // Mauve
    calendarSelected: '#8839ef',
    calendarDayWithTasks: '#40a02b', // Green
    calendarDayOtherMonth: '#9ca0b0', // Overlay 0

    taskBorder: '#ccd0da',
    taskHeader: '#1e66f5',
    taskCheckboxEmpty: '#9ca0b0',
    taskCheckboxFilled: '#40a02b',
    taskStateTodo: '#4c4f69',
    taskStateCompleted: '#6c6f85', // Subtext 0
    taskStateDelegated: '#ea76cb', // Pink
    taskStateDelayed: '#fe640b', // Peach
    taskIndent: '#bcc0cc', // Surface 1

    timelineBorder: '#ccd0da',
    timelineHeader: '#1e66f5',
    timelineTimestamp: '#6c6f85',
    timelineEventCreated: '#1e66f5',
    timelineEventStarted: '#fe640b',
    timelineEventCompleted: '#40a02b',
    timelineEventDelegated: '#ea76cb',
    timelineEventDelayed: '#d20f39', // Red

    separator: '#ccd0da',
    keyboardHint: '#6c6f85',
    helpDialogBorder: '#8839ef',
    focusIndicator: '#8839ef',

    modalOverlay: '#e6e9ef', // Mantle
    modalBackground: '#eff1f5',
  },
};
