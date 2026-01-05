'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EloChartProps {
    currentElo: number;
}

export default function EloChart({ currentElo }: EloChartProps) {
    // Generate mock history
    const data = [
        { month: 'Jan', elo: currentElo - 150 },
        { month: 'Feb', elo: currentElo - 120 },
        { month: 'Mar', elo: currentElo - 80 },
        { month: 'Apr', elo: currentElo - 40 },
        { month: 'May', elo: currentElo - 10 },
        { month: 'Jun', elo: currentElo },
    ];

    return (
        <div style={{ width: '100%', height: 250, fontSize: '0.8rem' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorElo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="month"
                        stroke="hsl(var(--foreground)/0.5)"
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--foreground)/0.5)"
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="elo"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "hsl(var(--primary))" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
