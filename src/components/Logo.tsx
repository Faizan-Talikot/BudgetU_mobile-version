import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface LogoProps {
    style?: StyleProp<ImageStyle>;
    size?: 'small' | 'medium' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ style, size = 'medium' }) => {
    const getSize = () => {
        switch (size) {
            case 'small':
                return { width: 100, height: 100 };
            case 'large':
                return { width: 200, height: 200 };
            default: // medium
                return { width: 150, height: 150 };
        }
    };

    return (
        <Image
            source={require('../assets/images/app_logo_budgetU.png')}
            style={[getSize(), style]}
            resizeMode="contain"
        />
    );
}; 