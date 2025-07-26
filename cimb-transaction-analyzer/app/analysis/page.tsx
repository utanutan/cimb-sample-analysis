"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import Link from "next/link"
import { EnhancedCharts } from "@/components/enhanced-charts"

interface Transaction {
  date: string
  description: string
  amount: number
  balance: number
  category?: string
}

interface CategorySummary {
  category: string
  amount: number
  count: number
  color: string
}

const CATEGORIES = ["食費", "交通費", "娯楽", "ショッピング", "光熱費", "医療費", "教育", "その他", "収入"]

const CATEGORY_COLORS = [
  "#0052CC",
  "#00A1DE",
  "#FFC107",
  "#28a745",
  "#dc3545",
  "#6f42c1",
  "#fd7e14",
  "#6c757d",
  "#20c997",
]

export default function AnalysisPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])

  useEffect(() => {
    // Load transactions from localStorage
    const storedTransactions = localStorage.getItem("transactions")
    if (storedTransactions) {
      const parsedTransactions: Transaction[] = JSON.parse(storedTransactions)

      // Auto-categorize transactions
      const categorizedTransactions = parsedTransactions.map((transaction) => ({
        ...transaction,
        category: categorizeTransaction(transaction.description, transaction.amount),
      }))

      setTransactions(categorizedTransactions)
      setFilteredTransactions(categorizedTransactions)
      updateCategorySummary(categorizedTransactions)
    }
  }, [])

  const categorizeTransaction = (description: string, amount: number): string => {
    if (amount > 0) return "収入"

    const desc = description.toLowerCase()
    if (desc.includes("grab") || desc.includes("food") || desc.includes("restaurant")) return "食費"
    if (desc.includes("fuel") || desc.includes("petronas") || desc.includes("transport")) return "交通費"
    if (desc.includes("shopee") || desc.includes("lazada") || desc.includes("shopping")) return "ショッピング"
    if (desc.includes("starbucks") || desc.includes("coffee") || desc.includes("cinema")) return "娯楽"
    return "その他"
  }

  const updateCategorySummary = (transactionList: Transaction[]) => {
    const summary: { [key: string]: { amount: number; count: number } } = {}

    transactionList.forEach((transaction) => {
      const category = transaction.category || "その他"
      if (!summary[category]) {
        summary[category] = { amount: 0, count: 0 }
      }
      summary[category].amount += Math.abs(transaction.amount)
      summary[category].count += 1
    })

    const summaryArray = Object.entries(summary).map(([category, data], index) => ({
      category,
      amount: data.amount,
      count: data.count,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))

    setCategorySummary(summaryArray.sort((a, b) => b.amount - a.amount))
  }

  const handleCategoryChange = (index: number, newCategory: string) => {
    const updatedTransactions = [...transactions]
    updatedTransactions[index].category = newCategory
    setTransactions(updatedTransactions)
    setFilteredTransactions(updatedTransactions)
    updateCategorySummary(updatedTransactions)
  }

  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netBalance = totalIncome - totalExpense

  const chartData = categorySummary
    .filter((item) => item.category !== "収入")
    .map((item) => ({
      category: item.category,
      amount: item.amount,
      fill: item.color,
    }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/upload" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>戻る</span>
            </Link>
            <h1 className="text-xl font-bold">データ分析</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="ml-2 text-green-500 font-medium">アップロード</span>
            </div>
            <div className="w-16 h-0.5 bg-[#0052CC]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#0052CC] text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-[#0052CC] font-medium">分析</span>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">分析期間</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {transactions.length > 0 && (
                    <>
                      {new Date(Math.min(...transactions.map((t) => new Date(t.date).getTime()))).toLocaleDateString(
                        "ja-JP",
                      )}
                      ～
                      {new Date(Math.max(...transactions.map((t) => new Date(t.date).getTime()))).toLocaleDateString(
                        "ja-JP",
                      )}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">総取引数</p>
                <p className="text-2xl font-bold">{transactions.length}件</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">総収入</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">RM {totalIncome.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">総支出</CardTitle>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">RM {totalExpense.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">純残高</CardTitle>
                <Wallet className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  RM {netBalance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <EnhancedCharts transactions={transactions} categorySummary={categorySummary} />

          {/* Category Summary */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別集計</CardTitle>
              <CardDescription>各カテゴリの詳細な集計結果</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">取引数</TableHead>
                    <TableHead className="text-right">合計金額</TableHead>
                    <TableHead className="text-right">平均金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorySummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span>{item.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">RM {item.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">RM {(item.amount / item.count).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>取引一覧</CardTitle>
              <CardDescription>すべての取引を表示しています。カテゴリは編集可能です。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Select
                          value={transaction.category}
                          onValueChange={(value) => handleCategoryChange(index, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell
                        className={`text-right ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        RM {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
