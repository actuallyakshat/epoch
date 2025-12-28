import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { addDays, addWeeks, subDays, subWeeks } from "date-fns";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Pane } from "../layout/Pane";
import { MonthView } from "./MonthView";
import { calendarService } from "../../services/calendarService";

export const CalendarPane: React.FC = () => {
  const { theme } = useTheme();
  const { selectedDate, setSelectedDate, tasks, activePane, isModalOpen } =
    useApp();
  const [currentMonth, setCurrentMonth] = useState({
    year: selectedDate.year,
    month: selectedDate.month,
  });

  // Update currentMonth when selectedDate changes to different month
  useEffect(() => {
    if (
      selectedDate.month !== currentMonth.month ||
      selectedDate.year !== currentMonth.year
    ) {
      setCurrentMonth({ year: selectedDate.year, month: selectedDate.month });
    }
  }, [selectedDate.year, selectedDate.month]);

  const calendarView = calendarService.generateMonthView(
    currentMonth.year,
    currentMonth.month,
    selectedDate,
    tasks
  );

  const isFocused = activePane === "calendar" && !isModalOpen;

  const navigateDate = (newDate: Date) => {
    setSelectedDate({
      year: newDate.getFullYear(),
      month: newDate.getMonth(),
      day: newDate.getDate(),
    });
  };

  useInput(
    (input: string, key) => {
      if (!isFocused) return;

      const currentDate = new Date(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day
      );

      // Navigate by day (h/l or left/right)
      if (input === "h" || key.leftArrow) {
        navigateDate(subDays(currentDate, 1));
        return;
      }

      if (input === "l" || key.rightArrow) {
        navigateDate(addDays(currentDate, 1));
        return;
      }

      // Navigate by week (j/k or down/up)
      if (input === "j" || key.downArrow) {
        navigateDate(addWeeks(currentDate, 1));
        return;
      }

      if (input === "k" || key.upArrow) {
        navigateDate(subWeeks(currentDate, 1));
        return;
      }

      // Navigate by month
      if (input === "n") {
        const next = calendarService.getNextMonth(
          currentMonth.year,
          currentMonth.month
        );
        setCurrentMonth(next);
        // Move selected date to first day of new month
        setSelectedDate({
          year: next.year,
          month: next.month,
          day: 1,
        });
        return;
      }

      if (input === "p") {
        const prev = calendarService.getPreviousMonth(
          currentMonth.year,
          currentMonth.month
        );
        setCurrentMonth(prev);
        // Move selected date to first day of new month
        setSelectedDate({
          year: prev.year,
          month: prev.month,
          day: 1,
        });
        return;
      }

      // Go to today
      if (input === "T") {
        const today = new Date();
        setSelectedDate({
          year: today.getFullYear(),
          month: today.getMonth(),
          day: today.getDate(),
        });
        return;
      }
    },
    { isActive: isFocused }
  );

  const monthName = calendarService.getMonthName(currentMonth.month);

  return (
    <Pane
      title={`${monthName} ${currentMonth.year}`}
      isFocused={isFocused}
      center
    >
      <Box flexDirection="column" alignItems="center">
        <MonthView calendarView={calendarView} />
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text color={theme.colors.keyboardHint} dimColor>
            h/l: days j/k: weeks
          </Text>
          <Text color={theme.colors.keyboardHint} dimColor>
            n/p: month T: today
          </Text>
        </Box>
      </Box>
    </Pane>
  );
};
