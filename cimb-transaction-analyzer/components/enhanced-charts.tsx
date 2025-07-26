"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Line, LineChart } from "recharts"
import { Calendar, TrendingDown } from "lucide-react"

interface Transaction {
  date: string
  description: string
  amount: number
  balance: number
  category?: string
}

interface EnhancedChartsProps {
  transactions: Transaction[]
  categorySummary: Array<{
    category: string
    amount: number
    count: number
    color: string
  }>
}

export function EnhancedCharts({ transactions, categorySummary }: EnhancedChartsProps) {
  // 月別支出データを生成
  const monthlyData = transactions
    .filter((t) => t.amount < 0)
    .reduce(
      (acc, transaction) => {
        const month = new Date(transaction.date).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "short",
        })

        if (!acc[month]) {
          acc[month] = 0
        }
        acc[month] += Math.abs(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    )

  const monthlyChartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  const chartData = categorySummary
    .filter((item) => item.category !== "収入")
    .map((item) => ({
      category: item.category,
      amount: item.amount,
      fill: item.color,
    }))

  // 期間情報を計算
  const dateRange =
    transactions.length > 0
      ? {
          start: new Date(Math.min(...transactions.map((t) => new Date(t.date).getTime()))),
          end: new Date(Math.max(...transactions.map((t) => new Date(t.date).getTime()))),
        }
      : null

  return (
    <div className="space-y-6">
      {/* 期間情報カード */}
      <Card className="bg-gradient-to-r from-[#0052CC]/5 to-[#00A1DE]/5 border-[#0052CC]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-[#0052CC]" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">分析期間</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dateRange && (
                    <>
                      {dateRange.start.toLocaleDateString("ja-JP")} ～ {dateRange.end.toLocaleDateString("ja-JP")}
                      <span className="ml-2">
                        ({Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))}日間)
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">総取引数</p>
              <p className="text-2xl font-bold text-[#0052CC]">{transactions.length}件</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* グラフセクション */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 棒グラフ - カテゴリ別支出 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-[#0052CC]" />
              カテゴリ別支出金額
            </CardTitle>
            <CardDescription>期間内の各カテゴリの支出合計金額（RM）</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "支出金額 (RM)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `RM ${value}`} axisLine={false} tickLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-[#0052CC]">支出: RM {payload[0].value?.toFixed(2)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 円グラフ - 支出割合 */}
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別支出割合</CardTitle>
            <CardDescription>全支出に占める各カテゴリの割合（%）</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="amount"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const total = chartData.reduce((sum, item) => sum + item.amount, 0)
                      const percentage = ((data.amount / total) * 100).toFixed(1)
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.category}</p>
                          <p className="text-[#0052CC]">金額: RM {data.amount.toFixed(2)}</p>
                          <p className="text-gray-600">割合: {percentage}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 月別支出推移グラフ */}
      {monthlyChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>月別支出推移</CardTitle>
            <CardDescription>月ごとの支出金額の変化</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "月別支出 (RM)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `RM ${value}`} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-[#00A1DE]">支出: RM {payload[0].value?.toFixed(2)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-amount)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
