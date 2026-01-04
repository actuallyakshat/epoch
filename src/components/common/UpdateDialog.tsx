import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from './Modal';

interface UpdateDialogProps {
  currentVersion: string;
  latestVersion: string;
  onDismiss: () => void;
  onSkipVersion: (version: string) => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  currentVersion,
  latestVersion,
  onDismiss,
  onSkipVersion,
}) => {
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<0 | 1 | 2>(0);

  const options = [
    { label: 'Dismiss', action: onDismiss },
    { label: 'Skip this version', action: () => onSkipVersion(latestVersion) },
  ];

  useInput((input, key) => {
    if (key.escape) {
      onDismiss();
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedOption((prev) => (prev > 0 ? ((prev - 1) as 0 | 1) : prev));
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedOption((prev) => (prev < options.length - 1 ? ((prev + 1) as 0 | 1 | 2) : prev));
      return;
    }

    if (key.return) {
      options[selectedOption].action();
      return;
    }
  });

  return (
    <Modal>
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor={theme.colors.helpDialogBorder}
        paddingX={2}
        paddingY={1}
        width={50}
        // @ts-ignore - backgroundColor is a valid Ink prop
        backgroundColor={theme.colors.modalBackground || theme.colors.background}
      >
        <Text bold color={theme.colors.calendarHeader}>
          Update Available
        </Text>

        <Box marginTop={1} flexDirection="column">
          <Text color={theme.colors.foreground}>A new version of Epoch is available!</Text>
          <Box marginTop={1}>
            <Text color={theme.colors.foreground} dimColor>
              Current:{' '}
            </Text>
            <Text color={theme.colors.taskDelayed}>{currentVersion}</Text>
            <Text color={theme.colors.foreground} dimColor>
              {'  →  '}
            </Text>
            <Text color={theme.colors.taskCompleted} bold>
              {latestVersion}
            </Text>
          </Box>
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text color={theme.colors.foreground} dimColor>
            To update, run:
          </Text>
          <Box marginTop={0} paddingLeft={1}>
            <Text color={theme.colors.timelineEventStarted}>npm install -g epoch-tui@latest</Text>
          </Box>
        </Box>

        <Box marginTop={1} flexDirection="column">
          {options.map((option, idx) => {
            const isSelected = idx === selectedOption;
            return (
              <Box key={option.label}>
                <Text
                  color={isSelected ? theme.colors.focusIndicator : theme.colors.foreground}
                  bold={isSelected}
                >
                  {isSelected ? '➜ ' : '  '}
                  {option.label}
                </Text>
              </Box>
            );
          })}
        </Box>

        <Box marginTop={1}>
          <Text color={theme.colors.keyboardHint} dimColor>
            ↑/↓ to navigate • Enter to select • Esc to dismiss
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};
