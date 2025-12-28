import type { Theme } from '../types/theme';

// X (Twitter) Light theme - Official X/Twitter light mode colors
export const xLightTheme: Theme = {
  name: 'x-light',
  colors: {
    background: '#ffffff',
    foreground: '#0f1419', // Twitter black text
    border: '#eff3f4',

    calendarBorder: '#eff3f4',
    calendarHeader: '#1d9bf0', // X Blue
    calendarToday: '#1d9bf0',
    calendarSelected: '#1d9bf0',
    calendarDayWithTasks: '#00ba7c', // Green
    calendarDayOtherMonth: '#536471', // Gray

    taskBorder: '#eff3f4',
    taskHeader: '#1d9bf0',
    taskCheckboxEmpty: '#536471',
    taskCheckboxFilled: '#00ba7c',
    taskStateTodo: '#0f1419',
    taskStateCompleted: '#536471',
    taskStateDelegated: '#7856ff', // Purple
    taskStateDelayed: '#f4212e', // Red (delayed = urgent)
    taskIndent: '#eff3f4',

    timelineBorder: '#eff3f4',
    timelineHeader: '#1d9bf0',
    timelineTimestamp: '#536471',
    timelineEventCreated: '#1d9bf0',
    timelineEventStarted: '#ffad1f', // Yellow
    timelineEventCompleted: '#00ba7c',
    timelineEventDelegated: '#7856ff',
    timelineEventDelayed: '#f4212e',

    separator: '#eff3f4',
    keyboardHint: '#536471',
    helpDialogBorder: '#1d9bf0',
    focusIndicator: '#1d9bf0',

    modalOverlay: '#00000033',
    modalBackground: '#ffffff',
  },
};
