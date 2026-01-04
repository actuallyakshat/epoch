import React, { useRef, useReducer, useEffect } from 'react';
import { Text, useInput } from 'ink';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  focus?: boolean;
  placeholderColor?: string;
  cursorColor?: string;
  color?: string;
  maxLength?: number;
};

export const ControlledTextInput: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
  focus = true,
  placeholderColor,
  cursorColor = 'white',
  color,
  maxLength,
}) => {
  // Use refs for ALL mutable state to avoid race conditions
  const valueRef = useRef(value);
  const cursorRef = useRef(value.length);

  // Force re-render mechanism
  const [, forceRender] = useReducer((x) => x + 1, 0);

  // Track emitted values to distinguish echoes from external changes
  const sentValuesRef = useRef(new Set<string>([value]));

  // Sync with external value changes
  useEffect(() => {
    if (value === valueRef.current) {
      return;
    }

    if (sentValuesRef.current.has(value)) {
      return;
    }

    // Genuine external change - accept it
    valueRef.current = value;
    cursorRef.current = value.length;
    sentValuesRef.current.clear();
    sentValuesRef.current.add(value);
    forceRender();
  }, [value]);

  // Helper to find word start (for Ctrl+W, Alt+B)
  const findWordStart = (text: string, pos: number): number => {
    let i = pos - 1;
    while (i >= 0 && text[i] === ' ') i--;
    while (i >= 0 && text[i] !== ' ') i--;
    return i + 1;
  };

  // Helper to find word end (for Alt+F)
  const findWordEnd = (text: string, pos: number): number => {
    let i = pos;
    while (i < text.length && text[i] === ' ') i++;
    while (i < text.length && text[i] !== ' ') i++;
    return i;
  };

  // Handle exit keys (Escape, Return)
  const handleExitKeys = (
    key: any,
    currentValue: string,
    onCancel?: () => void,
    onSubmit?: (value: string) => void,
  ): boolean => {
    if (key.escape) {
      onCancel?.();
      return true;
    }
    if (key.return) {
      onSubmit?.(currentValue);
      return true;
    }
    return false;
  };

  // Handle backspace and delete operations
  const handleBackspaceDelete = (
    key: any,
    currentValue: string,
    cursor: number,
  ): { value: string; cursor: number; handled: boolean } => {
    if (key.backspace) {
      if (key.ctrl) {
        const wordStart = findWordStart(currentValue, cursor);
        return {
          value: currentValue.slice(0, wordStart) + currentValue.slice(cursor),
          cursor: wordStart,
          handled: true,
        };
      } else if (cursor > 0) {
        return {
          value: currentValue.slice(0, cursor - 1) + currentValue.slice(cursor),
          cursor: cursor - 1,
          handled: true,
        };
      }
    } else if (key.delete) {
      if (cursor >= currentValue.length && cursor > 0) {
        return {
          value: currentValue.slice(0, cursor - 1) + currentValue.slice(cursor),
          cursor: cursor - 1,
          handled: true,
        };
      } else if (cursor < currentValue.length) {
        return {
          value: currentValue.slice(0, cursor) + currentValue.slice(cursor + 1),
          cursor,
          handled: true,
        };
      }
    }
    return { value: currentValue, cursor, handled: false };
  };

  // Handle cursor movement
  const handleCursorMovement = (
    input: string,
    key: any,
    currentValue: string,
    cursor: number,
  ): { cursor: number; handled: boolean } => {
    if (key.leftArrow && !key.ctrl) {
      return { cursor: Math.max(0, cursor - 1), handled: true };
    }
    if (key.rightArrow && !key.ctrl) {
      return { cursor: Math.min(currentValue.length, cursor + 1), handled: true };
    }
    if ((key.leftArrow && key.ctrl) || (key.meta && input === 'b')) {
      return { cursor: findWordStart(currentValue, cursor), handled: true };
    }
    if ((key.rightArrow && key.ctrl) || (key.meta && input === 'f')) {
      return { cursor: findWordEnd(currentValue, cursor), handled: true };
    }
    return { cursor, handled: false };
  };

  // Handle Ctrl key combinations
  const handleCtrlCombinations = (
    input: string,
    key: any,
    currentValue: string,
    cursor: number,
  ): { value: string; cursor: number; handled: boolean } => {
    if (key.ctrl && input === 'a') {
      return { value: currentValue, cursor: 0, handled: true };
    } else if (key.ctrl && input === 'e') {
      return { value: currentValue, cursor: currentValue.length, handled: true };
    } else if (key.ctrl && input === 'u') {
      return { value: currentValue.slice(cursor), cursor: 0, handled: true };
    } else if (key.ctrl && input === 'k') {
      return { value: currentValue.slice(0, cursor), cursor, handled: true };
    } else if (key.ctrl && input === 'w') {
      const wordStart = findWordStart(currentValue, cursor);
      return {
        value: currentValue.slice(0, wordStart) + currentValue.slice(cursor),
        cursor: wordStart,
        handled: true,
      };
    }
    return { value: currentValue, cursor, handled: false };
  };

  // Handle character input
  const handleCharacterInput = (
    input: string,
    key: any,
    currentValue: string,
    cursor: number,
    maxLength?: number,
  ): { value: string; cursor: number; handled: boolean } => {
    if (!key.ctrl && !key.meta && input.length > 0) {
      // Filter out non-printable control characters without using control characters in regex
      const filtered = Array.from(input)
        .filter((char) => {
          const code = char.codePointAt(0);
          if (code === undefined) return false;
          return (code >= 32 && code <= 126) || code > 127; // Basic printable ASCII + Extended
        })
        .join('');

      if (filtered) {
        const possibleValue = currentValue.slice(0, cursor) + filtered + currentValue.slice(cursor);
        if (!maxLength || possibleValue.length <= maxLength) {
          return {
            value: possibleValue,
            cursor: cursor + filtered.length,
            handled: true,
          };
        }
      }
    }
    return { value: currentValue, cursor, handled: false };
  };

  // Main key press handler that delegates to specific handlers
  const handleKeyPress = (
    input: string,
    key: any,
    currentValue: string,
    cursor: number,
    maxLength?: number,
  ): { value: string; cursor: number; handled: boolean } => {
    // Try backspace/delete
    const deleteResult = handleBackspaceDelete(key, currentValue, cursor);
    if (deleteResult.handled) return deleteResult;

    // Try cursor movement
    const movementResult = handleCursorMovement(input, key, currentValue, cursor);
    if (movementResult.handled) {
      return { value: currentValue, cursor: movementResult.cursor, handled: true };
    }

    // Try Ctrl combinations
    const ctrlResult = handleCtrlCombinations(input, key, currentValue, cursor);
    if (ctrlResult.handled) return ctrlResult;

    // Try character input
    const charResult = handleCharacterInput(input, key, currentValue, cursor, maxLength);
    if (charResult.handled) return charResult;

    return { value: currentValue, cursor, handled: false };
  };

  useInput(
    (input, key) => {
      const currentValue = valueRef.current;
      const cursor = cursorRef.current;

      // === EXIT HANDLERS ===
      if (handleExitKeys(key, currentValue, onCancel, onSubmit)) return;

      if (input === '\r' || input === '\n') return;

      // Handle all key types
      const {
        value: nextValue,
        cursor: nextCursor,
        handled,
      } = handleKeyPress(input, key, currentValue, cursor, maxLength);

      // Unhandled key - exit early
      if (!handled) return;

      // Update refs and trigger render if changed
      const valueChanged = nextValue !== currentValue;
      const cursorChanged = nextCursor !== cursor;

      if (valueChanged || cursorChanged) {
        valueRef.current = nextValue;
        cursorRef.current = nextCursor;

        if (valueChanged) {
          sentValuesRef.current.add(nextValue);
          onChange(nextValue);
        }

        forceRender();
      }
    },
    { isActive: focus },
  );

  // Read from refs for rendering
  const displayValue = valueRef.current;
  const cursor = cursorRef.current;
  const showPlaceholder = !displayValue && placeholder;

  // Split text around cursor
  const beforeCursor = displayValue.slice(0, cursor);
  const atCursor = displayValue[cursor] || ' ';
  const afterCursor = displayValue.slice(cursor + 1);

  return (
    <Text>
      {showPlaceholder ? (
        <>
          <Text dimColor color={placeholderColor}>
            {placeholder}
          </Text>
          {focus && <Text backgroundColor={cursorColor}> </Text>}
        </>
      ) : (
        <>
          <Text color={color}>{beforeCursor}</Text>
          {focus ? (
            <Text color={color} backgroundColor={cursorColor}>
              {atCursor}
            </Text>
          ) : (
            <Text color={color}>{atCursor}</Text>
          )}
          <Text color={color}>{afterCursor}</Text>
        </>
      )}
    </Text>
  );
};
