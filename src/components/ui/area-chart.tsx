import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface AreaChartProps {
  data: number[]
  categories: string[]
}

export function AreaChart({ data, categories }: AreaChartProps) {
  const chartData = data.map((value, index) => ({
    value,
    category: categories[index],
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsAreaChart data={chartData}>
        <XAxis
          dataKey="category"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))' 
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="linear"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}