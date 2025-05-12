import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

interface FormItemContextValue {
  id: string;
}

interface FormFieldProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

interface Styles {
  formItem: ViewStyle;
  label: TextStyle;
  error: TextStyle;
  description: TextStyle;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef<View, FormFieldProps>(
  ({ style, children }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <View ref={ref} style={[styles.formItem, style]}>
          {children}
        </View>
      </FormItemContext.Provider>
    );
  }
);

const FormLabel = React.forwardRef<Text, FormFieldProps>(
  ({ style, children }, ref) => {
    const { error } = useFormField();

    return (
      <Text
        ref={ref}
        style={[styles.label, error && styles.error, style]}
      >
        {children}
      </Text>
    );
  }
);

const FormDescription = React.forwardRef<Text, FormFieldProps>(
  ({ style, children }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <Text
        ref={ref}
        nativeID={formDescriptionId}
        style={[styles.description, style]}
      >
        {children}
      </Text>
    );
  }
);

const FormMessage = React.forwardRef<Text, FormFieldProps>(
  ({ style, children }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <Text
        ref={ref}
        nativeID={formMessageId}
        style={[styles.error, style]}
      >
        {body}
      </Text>
    );
  }
);

const styles = StyleSheet.create<Styles>({
  formItem: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

FormItem.displayName = 'FormItem';
FormLabel.displayName = 'FormLabel';
FormDescription.displayName = 'FormDescription';
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormField,
};
