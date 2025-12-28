import React, { useRef, useEffect } from "react";
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
  const pendingValueRef = useRef(value);

  // Track values we have emitted to distinguish echoes from external changes
  const sentValuesRef = useRef(new Set<string>([value]));

  useEffect(() => {
    // If the incoming value matches our current local state, we are in sync.
    if (value === pendingValueRef.current) {
      return;
    }

    // If the incoming value is one we sent recently, it's a "laggy echo".
    // We should IGNORE it to preserve the user's faster local typing.
    if (sentValuesRef.current.has(value)) {
      return;
    }

    // If we are here, the value is:
    // 1. Different from local state
    // 2. NOT in our sent history
    // This means it's a genuine external change (like a reset to ""), so we accept it.
    pendingValueRef.current = value;

    // Clear history on external reset to keep memory low
    sentValuesRef.current.clear();
    sentValuesRef.current.add(value);
  }, [value]);

  useInput(
    (input, key) => {
      const currentValue = pendingValueRef.current;

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

      if (key.backspace || key.delete) {
        nextValue = currentValue.slice(0, -1);
      } else if (!key.ctrl && !key.meta && input.length > 0) {
        // Filter standard input
        const filtered = input.replace(/[\x00-\x1F\x7F]/g, "");
        if (filtered) {
          const possibleValue = currentValue + filtered;
          if (maxLength && possibleValue.length > maxLength) {
            return;
          }
          nextValue = possibleValue;
        }
      }

      // Only update if changes occurred
      if (nextValue !== currentValue) {
        pendingValueRef.current = nextValue;

        // Mark this value as "sent" so the useEffect ignores it when it returns
        sentValuesRef.current.add(nextValue);
        onChange(nextValue);
      }
    },
    { isActive: focus }
  );

  const displayValue = pendingValueRef.current || "";
  const showPlaceholder = !displayValue && placeholder;

  return (
    <Text>
      {showPlaceholder ? (
        <Text dimColor color={placeholderColor}>
          {placeholder}
        </Text>
      ) : (
        <Text color={color}>{displayValue}</Text>
      )}
      {focus && <Text backgroundColor={cursorColor}> </Text>}
    </Text>
  );
};
