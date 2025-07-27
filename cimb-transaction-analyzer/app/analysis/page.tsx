"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingDown, TrendingUp, Wallet, Calendar, BarChart, ArrowUpCircle, ArrowDownCircle, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { EnhancedCharts } from "@/components/enhanced-charts"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface TransactionDetails {
  transactionType: string
  merchantInfo: string
  referenceNumber: string
  merchantName: string
  location: string
  paymentMethod: string
}

interface Transaction {
  date: string
  description: string
  amount: number
  balance: number
  category?: string
  icon?: string
  transactionDetails: TransactionDetails
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
  const [incomeCategorySummary, setIncomeCategorySummary] = useState<CategorySummary[]>([])
  const [expenseCategorySummary, setExpenseCategorySummary] = useState<CategorySummary[]>([])
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [viewMode, setViewMode] = useState<'all' | 'monthly'>('monthly')
  const [categoryTabView, setCategoryTabView] = useState<'expense' | 'income'>('expense')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // 現在の月のデータを抽出する関数
  const filterTransactionsByMonth = (transactions: Transaction[], yearMonth: string) => {
    if (!yearMonth || yearMonth === 'all') return transactions;
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionYearMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionYearMonth === yearMonth;
    });
  };

  // 利用可能な月のリストを生成する
  const getAvailableMonths = (transactions: Transaction[]) => {
    const monthsSet = new Set<string>();
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(yearMonth);
    });
    return Array.from(monthsSet).sort().reverse(); // 新しい月順にソート
  };

  // 現在の月を取得
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Load transactions from localStorage
    const storedTransactions = localStorage.getItem("transactions")
    if (storedTransactions) {
      const parsedTransactions: Transaction[] = JSON.parse(storedTransactions)

      // Auto-categorize transactions
      const categorizedTransactions = parsedTransactions.map((transaction) => ({
        ...transaction,
        category: transaction.category || categorizeTransaction(transaction.description, transaction.amount),
      }))

      // トランザクションを日付順に並び替え（新しい順）
      categorizedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(categorizedTransactions)
      
      // 利用可能な月を設定
      const months = getAvailableMonths(categorizedTransactions);
      setAvailableMonths(months);
      
      // 現在の月を取得
      const currentMonth = getCurrentYearMonth();
      
      // 現在の月があれば選択、なければ最新の月を選択
      const monthToSelect = months.includes(currentMonth) ? currentMonth : months[0] || '';
      setSelectedMonth(monthToSelect);
      
      // 選択した月でフィルタリング
      const filtered = filterTransactionsByMonth(categorizedTransactions, monthToSelect);
      setFilteredTransactions(filtered);
      updateCategorySummary(filtered);
    }
  }, [])

  // 月が変更されたときの処理
  useEffect(() => {
    if (viewMode === 'monthly' && selectedMonth) {
      const filtered = filterTransactionsByMonth(transactions, selectedMonth);
      setFilteredTransactions(filtered);
      updateCategorySummary(filtered);
    } else {
      setFilteredTransactions(transactions);
      updateCategorySummary(transactions);
    }
  }, [selectedMonth, transactions, viewMode])

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
    // 全体のサマリー用
    const summary: { [key: string]: { amount: number; count: number } } = {}
    // 収入用のサマリー
    const incomeSummary: { [key: string]: { amount: number; count: number } } = {}
    // 支出用のサマリー
    const expenseSummary: { [key: string]: { amount: number; count: number } } = {}

    transactionList.forEach((transaction) => {
      const category = transaction.category || "その他"
      const isIncome = transaction.amount >= 0
      
      // 全体のサマリーを更新
      if (!summary[category]) {
        summary[category] = { amount: 0, count: 0 }
      }
      summary[category].amount += Math.abs(transaction.amount)
      summary[category].count += 1
      
      // 収入または支出のサマリーを更新
      const targetSummary = isIncome ? incomeSummary : expenseSummary
      if (!targetSummary[category]) {
        targetSummary[category] = { amount: 0, count: 0 }
      }
      targetSummary[category].amount += Math.abs(transaction.amount)
      targetSummary[category].count += 1
    })

    // 全体サマリーの配列変換
    const summaryArray = Object.entries(summary).map(([category, data], index) => ({
      category,
      amount: data.amount,
      count: data.count,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    
    // 収入サマリーの配列変換
    const incomeSummaryArray = Object.entries(incomeSummary).map(([category, data], index) => ({
      category,
      amount: data.amount,
      count: data.count,
      color: CATEGORY_COLORS[(index + 2) % CATEGORY_COLORS.length],
    }))
    
    // 支出サマリーの配列変換
    const expenseSummaryArray = Object.entries(expenseSummary).map(([category, data], index) => ({
      category,
      amount: data.amount,
      count: data.count,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))

    setCategorySummary(summaryArray.sort((a, b) => b.amount - a.amount))
    setIncomeCategorySummary(incomeSummaryArray.sort((a, b) => b.amount - a.amount))
    setExpenseCategorySummary(expenseSummaryArray.sort((a, b) => b.amount - a.amount))
  }

  const handleCategoryChange = (index: number, newCategory: string) => {
    const updatedTransactions = [...transactions]
    updatedTransactions[index].category = newCategory
    setTransactions(updatedTransactions)
    setFilteredTransactions(updatedTransactions)
    updateCategorySummary(updatedTransactions)
  }

  const totalIncome = filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
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

        {/* 表示モード切替 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">分析期間</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredTransactions.length > 0 ? (
                    <>
                      {new Date(Math.min(...filteredTransactions.map((t) => new Date(t.date).getTime()))).toLocaleDateString(
                        "ja-JP",
                      )}
                      ～
                      {new Date(Math.max(...filteredTransactions.map((t) => new Date(t.date).getTime()))).toLocaleDateString(
                        "ja-JP",
                      )}
                    </>
                  ) : '該当データなし'}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* 表示モード切り替えボタン */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setViewMode('all');
                      setFilteredTransactions(transactions);
                      updateCategorySummary(transactions);
                    }}
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    全期間
                  </Button>
                  <Button
                    variant={viewMode === 'monthly' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setViewMode('monthly');
                      const filtered = filterTransactionsByMonth(transactions, selectedMonth);
                      setFilteredTransactions(filtered);
                      updateCategorySummary(filtered);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    月別
                  </Button>
                </div>

                {/* 月選択 */}
                {viewMode === 'monthly' && (
                  <Select
                    value={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="月を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map((month) => {
                        const [year, monthNum] = month.split('-');
                        return (
                          <SelectItem key={month} value={month}>
                            {year}年{parseInt(monthNum)}月
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="text-right space-y-1">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">表示取引数</p>
                  <p className="text-2xl font-bold">{filteredTransactions.length}件</p>
                  {viewMode === 'monthly' && transactions.length !== filteredTransactions.length && (
                    <p className="text-xs text-gray-500">全{transactions.length}件中</p>
                  )}
                </div>
                
                <div className="border-t pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">最新口座残高</p>
                  <p className="text-2xl font-bold text-blue-600">
                    RM {transactions.length > 0 ? transactions[0].balance.toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-gray-500">{transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString("ja-JP") : ''} 時点</p>
                </div>
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
                <CardTitle className="text-sm font-medium">合計</CardTitle>
                <Wallet className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  RM {netBalance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts with Tabs */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>カテゴリ別金額</CardTitle>
                  <div>
                    <Tabs defaultValue="expense" value={categoryTabView} onValueChange={(v) => setCategoryTabView(v as 'expense' | 'income')}>
                      <TabsList>
                        <TabsTrigger value="expense" className="flex items-center">
                          <ArrowDownCircle className="w-4 h-4 mr-2" />
                          支出
                        </TabsTrigger>
                        <TabsTrigger value="income" className="flex items-center">
                          <ArrowUpCircle className="w-4 h-4 mr-2" />
                          収入
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <CardDescription>
                  {categoryTabView === 'expense' ? 
                    'カテゴリ別の支出金額を表示しています' : 
                    'カテゴリ別の収入金額を表示しています'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryTabView === 'expense' ? (
                  <div className="w-full h-[300px]">
                    <RechartsBarChart width={500} height={300} data={expenseCategorySummary} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={50}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        tickFormatter={(value: number) => `RM ${value}`}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                      />
                      <RechartsTooltip formatter={(value: number) => [`RM ${Number(value).toFixed(2)}`, '金額']} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {expenseCategorySummary.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </div>
                ) : (
                  <div className="w-full h-[300px]">
                    <RechartsBarChart width={500} height={300} data={incomeCategorySummary} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={50}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        tickFormatter={(value: number) => `RM ${value}`}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                      />
                      <RechartsTooltip formatter={(value: number) => [`RM ${Number(value).toFixed(2)}`, '金額']} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {incomeCategorySummary.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>カテゴリ別割合</CardTitle>
                </div>
                <CardDescription>
                  {categoryTabView === 'expense' ? 
                    'カテゴリ別の支出割合を表示しています' : 
                    'カテゴリ別の収入割合を表示しています'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <PieChart width={500} height={300}>
                    <Pie
                      data={categoryTabView === 'expense' ? expenseCategorySummary : incomeCategorySummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {(categoryTabView === 'expense' ? expenseCategorySummary : incomeCategorySummary).map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [`RM ${Number(value).toFixed(2)}`, '金額']}
                      labelFormatter={(label: string) => `${label}`}
                    />
                  </PieChart>
                </div>
                <div className="mt-4 space-y-2">
                  {(categoryTabView === 'expense' ? expenseCategorySummary : incomeCategorySummary).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs">{item.category}</span>
                      </div>
                      <span className="text-xs">RM {item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <Card>
      <CardHeader>
        <CardTitle>カテゴリ別集計</CardTitle>
        <CardDescription>
          各カテゴリの詳細な集計結果。カテゴリをクリックすると明細が表示されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">カテゴリ</TableHead>
                <TableHead className="w-[15%] text-right">取引数</TableHead>
                <TableHead className="w-[25%] text-right">合計金額</TableHead>
                <TableHead className="w-[25%] text-right">平均金額</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categorySummary.map((item) => {
                const categoryTransactions = filteredTransactions.filter(
                  (t) => t.category === item.category
                );
                const isExpanded = expandedCategory === item.category;

                return (
                  <>
                    {/* サマリー行 */}
                    <TableRow
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : item.category)
                      }
                    >
                      <TableCell className="w-[30%]">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[15%] text-right">
                        {item.count}
                      </TableCell>
                      <TableCell className="w-[25%] text-right">
                        RM {item.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="w-[25%] text-right">
                        RM {(item.amount / item.count).toFixed(2)}
                      </TableCell>
                      <TableCell className="w-[5%]">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* 詳細行 */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <div className="bg-gray-50 p-4 w-full">
                            <p className="font-medium text-sm mb-2">
                              「{item.category}」の取引明細
                            </p>
                            <div className="max-h-[300px] overflow-y-auto w-full">
                              <Table className="w-full table-fixed">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[15%]">日付</TableHead>
                                    <TableHead className="w-[65%]">説明</TableHead>
                                    <TableHead className="w-[20%] text-right">
                                      金額
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {categoryTransactions.map((tx, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="w-[15%]">
                                        {new Date(tx.date).toLocaleDateString(
                                          "ja-JP"
                                        )}
                                      </TableCell>
                                      <TableCell className="w-[65%]">
                                        <div className="flex flex-col space-y-1">
                                          <span className="font-medium">
                                            {tx.transactionDetails.transactionType}
                                          </span>
                                          {tx.transactionDetails.merchantName && (
                                            <span className="text-sm">
                                              {tx.transactionDetails.merchantName}
                                            </span>
                                          )}
                                          {tx.transactionDetails.referenceNumber && (
                                            <span className="text-xs text-gray-500">
                                              {tx.transactionDetails.referenceNumber}
                                            </span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="w-[20%] text-right font-bold">
                                        <span
                                          className={
                                            tx.amount >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }
                                        >
                                          RM {Math.abs(tx.amount).toFixed(2)}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
                    <TableHead>金額</TableHead>
                    <TableHead className="w-[150px]">カテゴリ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => {
                    // 元のトランザクションリストのインデックスを検索
                    const originalIndex = transactions.findIndex(t => 
                      t.date === transaction.date && 
                      t.description === transaction.description && 
                      t.amount === transaction.amount
                    );
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString("ja-JP")}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <span className="font-medium">{transaction.transactionDetails?.transactionType || transaction.description}</span>
                            </div>
                            
                            {transaction.transactionDetails?.merchantName && (
                              <div className="text-sm">
                                <span className="font-semibold">店舗: </span>
                                <span>{transaction.transactionDetails.merchantName}</span>
                              </div>
                            )}
                            
                            {transaction.transactionDetails?.location && (
                              <div className="text-sm text-gray-600">
                                <span className="font-semibold">場所: </span>
                                <span>{transaction.transactionDetails.location}</span>
                              </div>
                            )}
                            
                            {transaction.transactionDetails?.referenceNumber && (
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold">参照番号: </span>
                                <span>{transaction.transactionDetails.referenceNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`${transaction.amount >= 0 ? "text-green-600" : "text-red-600"} font-bold`}
                        >
                          RM {Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={transaction.category}
                            onValueChange={(value) => handleCategoryChange(originalIndex !== -1 ? originalIndex : index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="選択" />
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
