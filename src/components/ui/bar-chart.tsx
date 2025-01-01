import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface BarChartProps {
  data: number[]
  categories: string[]
}

export function BarChart({ data, categories }: BarChartProps) {
  const chartData = data.map((value, index) => ({
    value,
    category: categories[index],
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={chartData}>
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
        <Bar
          dataKey="value"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}