import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from 'react-native';

interface AvatarProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

interface AvatarImageProps {
  source: ImageSourcePropType;
  alt?: string;
  style?: ImageStyle;
  onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
}

interface AvatarFallbackProps {
  style?: ViewStyle;
  children: React.ReactNode;
  delayMs?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  style,
  children,
}) => {
  return (
    <View style={[styles.avatar, style]}>
      {children}
    </View>
  );
};

const AvatarImage: React.FC<AvatarImageProps> = ({
  source,
  alt,
  style,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <Image
      source={source}
      accessibilityLabel={alt}
      style={[styles.image, style]}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
};

const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  children,
  style,
  delayMs = 600,
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={[styles.fallback, style]}>
      {typeof children === 'string' ? (
        <Text style={styles.fallbackText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

interface Styles {
  avatar: ViewStyle;
  image: ImageStyle;
  fallback: ViewStyle;
  fallbackText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  avatar: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
});

Avatar.displayName = 'Avatar';
AvatarImage.displayName = 'AvatarImage';
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
