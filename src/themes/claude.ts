import type { Theme } from '../types/theme';

// Claude theme with warm, sophisticated color palette
// Primary accent: Rust (#C15F3C)
// Secondary: Taupe (#B1ADA1)
// Background: Cream (#F4F3EE)
// Foreground: White (#FFFFFF)

export const claudeTheme: Theme = {
  name: 'claude',
  colors: {
    // Warm cream background with white text
    background: '#F4F3EE',
    foreground: '#1a1614',
    border: '#B1ADA1',

    // Calendar - Rust accents
    calendarBorder: '#B1ADA1',
    calendarHeader: '#C15F3C',
    calendarToday: '#C15F3C',
    calendarSelected: '#C15F3C',
    calendarDayWithTasks: '#C15F3C',
    calendarDayOtherMonth: '#736F66', // Darker for readability

    // Tasks - Warm palette
    taskBorder: '#B1ADA1',
    taskHeader: '#C15F3C',
    taskCheckboxEmpty: '#736F66', // Darker for readability
    taskCheckboxFilled: '#98C379',
    taskStateTodo: '#1a1614',
    taskStateCompleted: '#98C379',
    taskStateDelegated: '#736F66', // Darker for readability
    taskStateDelayed: '#E06C75',
    taskIndent: '#B1ADA1',

    // Timeline - Rust theme
    timelineBorder: '#B1ADA1',
    timelineHeader: '#C15F3C',
    timelineTimestamp: '#736F66', // Darker for readability
    timelineEventCreated: '#61AFEF',
    timelineEventStarted: '#C15F3C',
    timelineEventCompleted: '#98C379',
    timelineEventDelegated: '#736F66',
    timelineEventDelayed: '#E06C75',

    // UI elements
    separator: '#B1ADA1',
    keyboardHint: '#736F66', // Darker for readability
    helpDialogBorder: '#C15F3C',
    focusIndicator: '#C15F3C',

    // Modal - Light overlay
    modalOverlay: '#F4F3EE',
    modalBackground: '#FFFFFF',
  },
};
