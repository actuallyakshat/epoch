import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { useStorage } from '../../contexts/StorageContext';
import { Modal } from './Modal';
import { logger } from '../../utils/logger';

export const SettingsDialog: React.FC = () => {
  const { theme } = useTheme();
  const { setShowSettingsDialog } = useApp();
  const { data, save } = useStorage();

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Settings options
  const settings = [
    {
      label: 'Auto-move unfinished tasks to next day',
      key: 'autoMoveUnfinishedTasks',
      value: data?.settings?.autoMoveUnfinishedTasks ?? true,
    },
  ];

  const toggleSetting = (key: string) => {
    if (!data) return;

    const newValue = !data.settings[key as keyof typeof data.settings];
    logger.log('Toggling setting', { key, newValue });

    save({
      ...data,
      settings: {
        ...data.settings,
        [key]: newValue,
      },
    });
  };

  useInput(
    (input, key) => {
      // Escape closes dialog
      if (key.escape) {
        logger.log('Closing settings dialog');
        setShowSettingsDialog(false);
        return;
      }

      // Navigate settings
      if (key.upArrow || input === 'k') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : settings.length - 1));
        return;
      }

      if (key.downArrow || input === 'j') {
        setSelectedIndex((prev) => (prev < settings.length - 1 ? prev + 1 : 0));
        return;
      }

      // Toggle setting with Space or Enter
      if (key.return || input === ' ') {
        toggleSetting(settings[selectedIndex].key);
        return;
      }
    },
    { isActive: true },
  );

  return (
    <Modal>
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.helpDialogBorder}
        paddingX={2}
        paddingY={1}
        width={70}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={theme.colors.modalBackground || theme.colors.background}
      >
        <Text bold color={theme.colors.calendarHeader} underline>
          Settings
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {settings.map((setting, idx) => {
            const isSelected = idx === selectedIndex;
            const isEnabled = setting.value;

            return (
              <Box key={setting.key} marginY={0}>
                <Text
                  color={isSelected ? theme.colors.focusIndicator : theme.colors.foreground}
                  bold={isSelected}
                >
                  {isSelected ? '➜ ' : '  '}
                  {setting.label}
                  {': '}
                  <Text
                    color={
                      isEnabled ? theme.colors.taskStateCompleted : theme.colors.taskStateDelayed
                    }
                  >
                    {isEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Text>
              </Box>
            );
          })}
        </Box>
        <Box marginTop={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            ↑/↓ or k/j to navigate • Space/Enter to toggle • Esc to close
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
