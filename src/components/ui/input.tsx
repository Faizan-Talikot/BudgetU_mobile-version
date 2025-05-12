import React from 'react';
import { TextInput, StyleSheet, TextStyle, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  style?: TextStyle;
}

interface Styles {
  input: TextStyle;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholderTextColor="#666"
        {...props}
      />
    );
  }
);

const styles = StyleSheet.create<Styles>({
  input: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
});

Input.displayName = 'Input';

export { Input };
