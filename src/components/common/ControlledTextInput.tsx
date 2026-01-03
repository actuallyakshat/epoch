import React, { useRef, useReducer, useEffect } from "react";
import { Text, useInput } from "ink";

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
  cursorColor = "white",
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
    while (i >= 0 && text[i] === " ") i--;
    while (i >= 0 && text[i] !== " ") i--;
    return i + 1;
  };

  // Helper to find word end (for Alt+F)
  const findWordEnd = (text: string, pos: number): number => {
    let i = pos;
    while (i < text.length && text[i] === " ") i++;
    while (i < text.length && text[i] !== " ") i++;
    return i;
  };

  useInput(
    (input, key) => {
      const currentValue = valueRef.current;
      const cursor = cursorRef.current;

      // === EXIT HANDLERS ===
      if (key.escape) {
        onCancel?.();
        return;
      }

      if (key.return) {
        onSubmit(currentValue);
        return;
      }

      if (input === "\r" || input === "\n") return;

      let nextValue = currentValue;
      let nextCursor = cursor;

      // === BACKSPACE - handle first, most common operation ===
      if (key.backspace) {
        // Ctrl+W or Ctrl+Backspace: delete word
        if (key.ctrl) {
          const wordStart = findWordStart(currentValue, cursor);
          nextValue = currentValue.slice(0, wordStart) + currentValue.slice(cursor);
          nextCursor = wordStart;
        }
        // Regular backspace: delete one char
        else if (cursor > 0) {
          nextValue = currentValue.slice(0, cursor - 1) + currentValue.slice(cursor);
          nextCursor = cursor - 1;
        }
      }
      // === DELETE KEY (some terminals send this for backspace) ===
      else if (key.delete) {
        // At end of line? Treat as backspace (delete before cursor)
        if (cursor >= currentValue.length && cursor > 0) {
          nextValue = currentValue.slice(0, cursor - 1) + currentValue.slice(cursor);
          nextCursor = cursor - 1;
        }
        // In middle? Forward delete (delete at cursor)
        else if (cursor < currentValue.length) {
          nextValue = currentValue.slice(0, cursor) + currentValue.slice(cursor + 1);
        }
      }
      // === CURSOR MOVEMENT ===
      else if (key.leftArrow && !key.ctrl) {
        nextCursor = Math.max(0, cursor - 1);
      }
      else if (key.rightArrow && !key.ctrl) {
        nextCursor = Math.min(currentValue.length, cursor + 1);
      }
      // Ctrl+Left: move back one word
      else if (key.leftArrow && key.ctrl) {
        const wordStart = findWordStart(currentValue, cursor);
        nextCursor = wordStart;
      }
      // Ctrl+Right: move forward one word
      else if (key.rightArrow && key.ctrl) {
        const wordEnd = findWordEnd(currentValue, cursor);
        nextCursor = wordEnd;
      }
      // Alt+B: move back one word (readline standard)
      else if (key.meta && input === "b") {
        const wordStart = findWordStart(currentValue, cursor);
        nextCursor = wordStart;
      }
      // Alt+F: move forward one word (readline standard)
      else if (key.meta && input === "f") {
        const wordEnd = findWordEnd(currentValue, cursor);
        nextCursor = wordEnd;
      }
      // === CTRL COMBINATIONS ===
      else if (key.ctrl && input === "a") {
        // Move to start
        nextCursor = 0;
      }
      else if (key.ctrl && input === "e") {
        // Move to end
        nextCursor = currentValue.length;
      }
      else if (key.ctrl && input === "u") {
        // Delete to start of line
        nextValue = currentValue.slice(cursor);
        nextCursor = 0;
      }
      else if (key.ctrl && input === "k") {
        // Delete to end of line
        nextValue = currentValue.slice(0, cursor);
      }
      else if (key.ctrl && input === "w") {
        // Delete word (backup if backspace check didn't catch it)
        const wordStart = findWordStart(currentValue, cursor);
        nextValue = currentValue.slice(0, wordStart) + currentValue.slice(cursor);
        nextCursor = wordStart;
      }
      // === CHARACTER INPUT ===
      else if (!key.ctrl && !key.meta && input.length > 0) {
        const filtered = input.replace(/[\x00-\x1F\x7F]/g, "");
        if (filtered) {
          const possibleValue = currentValue.slice(0, cursor) + filtered + currentValue.slice(cursor);
          if (!maxLength || possibleValue.length <= maxLength) {
            nextValue = possibleValue;
            nextCursor = cursor + filtered.length;
          }
        }
      }
      // Unhandled key
      else {
        return;
      }

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
    { isActive: focus }
  );

  // Read from refs for rendering
  const displayValue = valueRef.current;
  const cursor = cursorRef.current;
  const showPlaceholder = !displayValue && placeholder;

  // Split text around cursor
  const beforeCursor = displayValue.slice(0, cursor);
  const atCursor = displayValue[cursor] || " ";
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
