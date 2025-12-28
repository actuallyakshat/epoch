import type { Theme } from '../types/theme';

// Claude Code theme inspired by Anthropic's brand colors
// Primary accent: Claude Orange (#E67D22)
// Secondary: Claude Coral (#D97757)
// Warm color palette with dark brown backgrounds

export const claudeCodeTheme: Theme = {
  name: 'claude-code',
  colors: {
    // Warm dark brown background with cream text
    background: '#1a1614',
    foreground: '#F5E6D3',
    border: '#3a2f2a',

    // Calendar - Claude orange accents
    calendarBorder: '#3a2f2a',
    calendarHeader: '#E67D22',
    calendarToday: '#D97757',
    calendarSelected: '#E67D22',
    calendarDayWithTasks: '#FFB38A',
    calendarDayOtherMonth: '#6e5d52',

    // Tasks - Warm palette
    taskBorder: '#3a2f2a',
    taskHeader: '#E67D22',
    taskCheckboxEmpty: '#6e5d52',
    taskCheckboxFilled: '#98C379',
    taskStateTodo: '#F5E6D3',
    taskStateCompleted: '#98C379',
    taskStateDelegated: '#C4A584',
    taskStateDelayed: '#E06C75',
    taskIndent: '#6e5d52',

    // Timeline - Claude orange theme
    timelineBorder: '#3a2f2a',
    timelineHeader: '#E67D22',
    timelineTimestamp: '#C4A584',
    timelineEventCreated: '#61AFEF',
    timelineEventStarted: '#FFB38A',
    timelineEventCompleted: '#98C379',
    timelineEventDelegated: '#D97757',
    timelineEventDelayed: '#E06C75',

    // UI elements
    separator: '#3a2f2a',
    keyboardHint: '#6e5d52',
    helpDialogBorder: '#E67D22',
    focusIndicator: '#E67D22',

    // Modal - Warm dark overlay
    modalOverlay: '#0f0d0c',
    modalBackground: '#1a1614',
  },
};
