import React from 'react';
import Svg, { Circle, Rect, Path, Line, Text } from 'react-native-svg';

export const TrackExpenses = ({ width = 300, height = 300 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 300 300">
            {/* Background Circle */}
            <Circle cx="150" cy="150" r="120" fill="#E8F5E9" opacity="0.5" />

            {/* Wallet */}
            <Rect x="90" y="100" width="120" height="80" rx="10" fill="#4CAF50" />
            <Rect x="85" y="120" width="130" height="70" rx="10" fill="#2E7D32" />

            {/* Money */}
            <Rect x="100" y="140" width="60" height="40" rx="5" fill="#81C784" />
            <Circle cx="130" cy="160" r="15" fill="#C8E6C9" />
            <Text x="125" y="165" fontSize="16" fill="#1B5E20">$</Text>

            {/* Receipt */}
            <Path d="M170 90 L190 90 L190 170 L180 160 L170 170 L170 90" fill="#FFFFFF" stroke="#4CAF50" strokeWidth="2" />
            <Line x1="175" y1="110" x2="185" y2="110" stroke="#4CAF50" strokeWidth="2" />
            <Line x1="175" y1="120" x2="185" y2="120" stroke="#4CAF50" strokeWidth="2" />
            <Line x1="175" y1="130" x2="185" y2="130" stroke="#4CAF50" strokeWidth="2" />
        </Svg>
    );
}; 