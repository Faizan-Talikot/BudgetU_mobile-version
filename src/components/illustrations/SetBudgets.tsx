import React from 'react';
import Svg, { Circle, Ellipse, Rect, Text } from 'react-native-svg';

export const SetBudgets = ({ width = 300, height = 300 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 300 300">
            {/* Background Circle */}
            <Circle cx="150" cy="150" r="120" fill="#E3F2FD" opacity="0.5" />

            {/* Piggy Bank */}
            <Ellipse cx="150" cy="150" rx="80" ry="60" fill="#1976D2" />
            <Circle cx="200" cy="130" r="10" fill="#FFFFFF" />
            <Rect x="220" y="140" width="20" height="40" rx="5" fill="#1565C0" />

            {/* Coin Slot */}
            <Rect x="140" y="110" width="40" height="5" rx="2" fill="#0D47A1" />

            {/* Coins */}
            <Circle cx="100" cy="200" r="15" fill="#FFC107" />
            <Circle cx="120" cy="210" r="15" fill="#FFC107" />
            <Circle cx="140" cy="215" r="15" fill="#FFC107" />

            {/* Dollar Signs */}
            <Text x="95" y="205" fontSize="16" fill="#FFA000">$</Text>
            <Text x="115" y="215" fontSize="16" fill="#FFA000">$</Text>
            <Text x="135" y="220" fontSize="16" fill="#FFA000">$</Text>
        </Svg>
    );
};
