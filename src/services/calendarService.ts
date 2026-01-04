import { generateMonthCalendar, getDateString, isToday } from '../utils/date';
import type { CalendarView, CalendarDay, CalendarDate } from '../types/calendar';
import type { TaskTree } from '../types/task';

export class CalendarService {
  generateMonthView(
    year: number,
    month: number,
    selectedDate: CalendarDate,
    tasks: TaskTree,
  ): CalendarView {
    const weeks = generateMonthCalendar(year, month);

    const calendarDays = weeks.map((week) =>
      week.map((date) => this.createCalendarDay(date, selectedDate, tasks, month)),
    );

    return {
      year,
      month,
      weeks: calendarDays,
    };
  }

  private createCalendarDay(
    date: Date,
    selectedDate: CalendarDate,
    tasks: TaskTree,
    currentMonth: number,
  ): CalendarDay {
    const dateString = getDateString(date);
    const dayTasks = tasks[dateString] || [];

    return {
      date: {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      },
      dateString,
      isToday: isToday(date),
      isSelected: this.isSameDay(date, selectedDate),
      isCurrentMonth: date.getMonth() === currentMonth,
      hasTasks: dayTasks.length > 0,
      taskCount: dayTasks.length,
    };
  }

  private isSameDay(date: Date, calendarDate: CalendarDate): boolean {
    return (
      date.getDate() === calendarDate.day &&
      date.getMonth() === calendarDate.month &&
      date.getFullYear() === calendarDate.year
    );
  }

  getNextMonth(year: number, month: number): { year: number; month: number } {
    if (month === 11) {
      return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
  }

  getPreviousMonth(year: number, month: number): { year: number; month: number } {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  }

  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month];
  }
}

export const calendarService = new CalendarService();
