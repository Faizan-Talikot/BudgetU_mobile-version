import React from 'react';
import Svg, { Circle, Path, Rect, Ellipse, Text } from 'react-native-svg';

export const AchieveGoals = ({ width = 300, height = 300 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 300 300">
            {/* Background Circle */}
            <Circle cx="150" cy="150" r="120" fill="#FFF3E0" opacity="0.5" />

            {/* Trophy */}
            <Path d="M120 100 L180 100 L190 200 L110 200 Z" fill="#FF9800" />
            <Ellipse cx="150" cy="100" rx="30" ry="10" fill="#F57C00" />
            <Rect x="140" y="200" width="20" height="30" fill="#E65100" />
            <Rect x="120" y="230" width="60" height="10" rx="5" fill="#E65100" />

            {/* Stars */}
            <Path d="M80 120 L85 130 L95 130 L87 137 L90 147 L80 142 L70 147 L73 137 L65 130 L75 130 Z" fill="#FFC107" />
            <Path d="M220 120 L225 130 L235 130 L227 137 L230 147 L220 142 L210 147 L213 137 L205 130 L215 130 Z" fill="#FFC107" />
            <Path d="M150 60 L155 70 L165 70 L157 77 L160 87 L150 82 L140 87 L143 77 L135 70 L145 70 Z" fill="#FFC107" />

            {/* Goal Text */}
            <Text x="120" y="150" fontSize="24" fontWeight="bold" fill="#FFFFFF">GOAL</Text>
        </Svg>
    );
}; 