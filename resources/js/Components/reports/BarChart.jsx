import React, { useState } from 'react';

const BarChart = ({
    data = [],
    height = 300,
    labelKey = 'label',
    valueKey = 'value',
    formatValue = (val) => val,
    barColor = 'hsl(var(--primary))',
    barColorGradientStart = 'hsl(var(--primary))',
    barColorGradientEnd = 'hsl(var(--primary)/0.6)',
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
                No data available
            </div>
        );
    }

    // Calculate dimensions and scales
    const maxValue = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
    const chartHeight = height - 40; // Reserve space for x-axis labels
    const barWidthPercentage = 0.6; // Width of bar relative to slot width

    return (
        <div className="w-full relative select-none" style={{ height }}>
            {/* Grid & Axis */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
                {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                    <div key={i} className="w-full border-t border-dashed border-border relative">
                        <span className="absolute -top-3 right-0 text-[10px] text-muted-foreground bg-card px-1 z-10">
                            {formatValue(maxValue * ratio)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around pb-10 pl-2 pr-6">
                {data.map((item, index) => {
                    const value = Number(item[valueKey]) || 0;
                    const heightPercent = (value / maxValue) * 100;
                    const isHovered = hoveredIndex === index;

                    return (
                        <div
                            key={index}
                            className="h-full flex-1 flex items-end justify-center group relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Bar */}
                            <div
                                className="w-[80%] max-w-[60px] rounded-t-lg transition-all duration-500 ease-out relative cursor-pointer"
                                style={{
                                    height: `${heightPercent}%`,
                                    background: `linear-gradient(to bottom, ${barColorGradientStart}, ${barColorGradientEnd})`,
                                    opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
                                    transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                                    transformOrigin: 'bottom',
                                }}
                            >
                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200 border">
                                        {formatValue(value)}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover"></div>
                                    </div>
                                )}
                            </div>

                            {/* X-Axis Label */}
                            <div className="absolute bottom-[-30px] left-0 right-0 text-center">
                                <span className={`text-xs font-medium transition-colors duration-200 ${isHovered ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                    {item[labelKey]}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BarChart;
