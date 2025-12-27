export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface CalendarDay {
  date: CalendarDate;
  dateString: string;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  hasTasks: boolean;
  taskCount: number;
}

export interface CalendarView {
  year: number;
  month: number;
  weeks: CalendarDay[][];
}
