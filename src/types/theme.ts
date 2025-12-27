export interface ColorScheme {
  background?: string;
  foreground?: string;
  border?: string;

  calendarBorder?: string;
  calendarHeader?: string;
  calendarToday?: string;
  calendarSelected?: string;
  calendarDayWithTasks?: string;
  calendarDayOtherMonth?: string;

  taskBorder?: string;
  taskHeader?: string;
  taskCheckboxEmpty?: string;
  taskCheckboxFilled?: string;
  taskStateTodo?: string;
  taskStateCompleted?: string;
  taskStateDelegated?: string;
  taskStateDelayed?: string;
  taskIndent?: string;

  timelineBorder?: string;
  timelineHeader?: string;
  timelineTimestamp?: string;
  timelineEventCreated?: string;
  timelineEventStarted?: string;
  timelineEventCompleted?: string;
  timelineEventDelegated?: string;
  timelineEventDelayed?: string;

  separator?: string;
  keyboardHint?: string;
  helpDialogBorder?: string;
  focusIndicator?: string;

  modalOverlay?: string;
  modalBackground?: string;
}

export interface Theme {
  name: string;
  colors: ColorScheme;
}
