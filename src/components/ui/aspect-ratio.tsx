import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface AspectRatioProps {
    ratio?: number;
    style?: ViewStyle;
    children: React.ReactNode;
}

const AspectRatio: React.FC<AspectRatioProps> = ({
    ratio = 1,
    style,
    children,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={[styles.measurer, { paddingTop: `${(1 / ratio) * 100}%` }]} />
            <View style={styles.content}>{children}</View>
        </View>
    );
};

interface Styles {
    container: ViewStyle;
    measurer: ViewStyle;
    content: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
    container: {
        position: 'relative',
        width: '100%',
    },
    measurer: {
        width: '100%',
    },
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export { AspectRatio };
