import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onCancel: () => void;
  onOk: () => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  onCancel,
  onOk,
}) => {
  // Parse initial time
  const initialTime = new Date(`2000-01-01T${value}`);
  const [hours, setHours] = useState(initialTime.getHours());
  const [minutes, setMinutes] = useState(initialTime.getMinutes());
  const [isPM, setIsPM] = useState(hours >= 12);
  const [inputError, setInputError] = useState('');
  const [hourInput, setHourInput] = useState(
    (hours === 0 ? 12 : hours > 12 ? hours - 12 : hours).toString()
  );
  const [minuteInput, setMinuteInput] = useState(
    minutes.toString().padStart(2, '0')
  );

  // Convert 24h to 12h format
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  const handleHourChange = (text: string) => {
    setInputError('');
    // Allow empty input for new entries
    if (text === '') {
      setHourInput('');
      return;
    }

    // Only allow numbers
    if (!/^\d+$/.test(text)) {
      return;
    }

    setHourInput(text);
    const num = parseInt(text);
    
    if (num >= 1 && num <= 12) {
      setHours(isPM ? (num % 12) + 12 : num % 12);
      setInputError('');
    } else {
      setInputError('Please enter a valid hour (1-12)');
      // Don't update hours but allow the input to be shown
    }
  };

  const handleMinuteChange = (text: string) => {
    setInputError('');
    // Allow empty input for new entries
    if (text === '') {
      setMinuteInput('');
      return;
    }

    // Only allow numbers
    if (!/^\d+$/.test(text)) {
      return;
    }

    setMinuteInput(text);
    const num = parseInt(text);
    
    if (num >= 0 && num <= 59) {
      setMinutes(num);
      setInputError('');
    } else {
      setInputError('Please enter a valid minute (0-59)');
      // Don't update minutes but allow the input to be shown
    }
  };

  const handleHourBlur = () => {
    // Reset to valid value on blur
    if (hourInput === '' || parseInt(hourInput) < 1 || parseInt(hourInput) > 12) {
      setHourInput(displayHours.toString());
      setInputError('');
    }
  };

  const handleMinuteBlur = () => {
    // Reset to valid value on blur
    if (minuteInput === '' || parseInt(minuteInput) < 0 || parseInt(minuteInput) > 59) {
      setMinuteInput(minutes.toString().padStart(2, '0'));
      setInputError('');
    }
  };

  const toggleAMPM = () => {
    setIsPM(!isPM);
    const newHours = hours >= 12 ? hours - 12 : hours + 12;
    setHours(newHours);
    setHourInput((newHours === 0 ? 12 : newHours > 12 ? newHours - 12 : newHours).toString());
  };

  // Update parent component with new time
  React.useEffect(() => {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    onChange(`${formattedHours}:${formattedMinutes}`);
  }, [hours, minutes]);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.timeInputContainer}>
            {/* Hours Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                value={hourInput}
                onChangeText={handleHourChange}
                onBlur={handleHourBlur}
                placeholder="12"
                placeholderTextColor={colors.textSecondary}
                selectTextOnFocus={true}
              />
              <Text style={styles.timeLabel}>Hour</Text>
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            {/* Minutes Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                value={minuteInput}
                onChangeText={handleMinuteChange}
                onBlur={handleMinuteBlur}
                placeholder="00"
                placeholderTextColor={colors.textSecondary}
                selectTextOnFocus={true}
              />
              <Text style={styles.timeLabel}>Minute</Text>
            </View>

            {/* AM/PM Toggle */}
            <TouchableOpacity 
              style={styles.amPmToggle} 
              onPress={toggleAMPM}
            >
              <Text style={styles.amPmText}>{isPM ? 'PM' : 'AM'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onOk} 
            style={styles.actionButton}
            disabled={!!inputError}
          >
            <Text style={[
              styles.actionButtonText,
              inputError ? styles.disabledText : null
            ]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 360,
    top: '50%',
    left: '5%',
    transform: [{ translateY: -120 }],
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  inputWrapper: {
    alignItems: 'center',
  },
  timeInput: {
    fontSize: 40,
    color: colors.text,
    fontWeight: '300',
    textAlign: 'center',
    minWidth: 60,
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  timeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 40,
    color: colors.text,
    fontWeight: '300',
    marginTop: 8,
  },
  amPmToggle: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
    marginTop: 8,
  },
  amPmText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
  },
  actionButton: {
    paddingVertical: 12,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
}); 