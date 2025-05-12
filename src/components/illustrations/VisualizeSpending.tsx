import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const VisualizeSpending = ({ width = 300, height = 300 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 300 300">
            {/* Background Circle */}
            <Circle cx="150" cy="150" r="120" fill="#F3E5F5" opacity="0.5" />

            {/* Pie Chart */}
            <Path d="M150 100 A50 50 0 0 1 200 150 L150 150 Z" fill="#9C27B0" />
            <Path d="M150 150 L200 150 A50 50 0 0 1 150 200 Z" fill="#7B1FA2" />
            <Path d="M150 150 L150 200 A50 50 0 0 1 100 150 Z" fill="#6A1B9A" />
            <Path d="M150 150 L100 150 A50 50 0 0 1 150 100 Z" fill="#4A148C" />

            {/* Bar Chart */}
            <Rect x="220" y="120" width="20" height="80" fill="#9C27B0" />
            <Rect x="250" y="140" width="20" height="60" fill="#7B1FA2" />

            {/* Line Chart */}
            <Path d="M60 180 L90 160 L120 170 L150 140" stroke="#9C27B0" strokeWidth="3" fill="none" />
            <Circle cx="60" cy="180" r="4" fill="#9C27B0" />
            <Circle cx="90" cy="160" r="4" fill="#9C27B0" />
            <Circle cx="120" cy="170" r="4" fill="#9C27B0" />
            <Circle cx="150" cy="140" r="4" fill="#9C27B0" />
        </Svg>
    );
}; 