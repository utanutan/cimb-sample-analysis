"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Transaction {
  date: string
  description: string
  amount: number
  balance: number
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("CSVファイルを選択してください")
      return
    }

    setFile(selectedFile)
    setError(null)
    processFile(selectedFile)
  }

  const processFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate file processing
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Mock CSV parsing - in real app, use Papa Parse
      const mockTransactions: Transaction[] = [
        { date: "2024-01-15", description: "GRAB*FOOD DELIVERY", amount: -25.5, balance: 1500.25 },
        { date: "2024-01-14", description: "SALARY CREDIT", amount: 3500.0, balance: 1525.75 },
        { date: "2024-01-13", description: "SHOPEE*ONLINE SHOPPING", amount: -89.9, balance: -1974.25 },
        { date: "2024-01-12", description: "PETRONAS FUEL", amount: -65.0, balance: -1884.35 },
        { date: "2024-01-11", description: "STARBUCKS COFFEE", amount: -18.5, balance: -1819.35 },
      ]

      setTransactions(mockTransactions)
      setUploading(false)
    } catch (err) {
      setError("ファイルの処理中にエラーが発生しました")
      setUploading(false)
    }
  }

  const handleAnalyze = () => {
    // Store transactions in localStorage for the analysis page
    localStorage.setItem("transactions", JSON.stringify(transactions))
    router.push("/analysis")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>戻る</span>
            </Link>
            <h1 className="text-xl font-bold">CSVアップロード</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#0052CC] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="ml-2 text-[#0052CC] font-medium">アップロード</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-gray-600">分析</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                CSVファイルをアップロード
              </CardTitle>
              <CardDescription>CIMBからダウンロードした取引履歴CSVファイルを選択してください</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-[#0052CC] bg-[#0052CC]/5" : "border-gray-300 hover:border-[#0052CC]/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ファイルをドラッグ&ドロップ
                    </p>
                    <p className="text-gray-500 mb-4">または</p>
                    <Button onClick={() => document.getElementById("file-input")?.click()} variant="outline">
                      ファイルを選択
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
                    {uploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-gray-500">処理中... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sample Format */}
          <Card>
            <CardHeader>
              <CardTitle>CSVフォーマット例</CardTitle>
              <CardDescription>以下のような形式のCSVファイルに対応しています</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                Date,Description,Amount,Balance
                <br />
                15/01/2024,GRAB*FOOD DELIVERY,-25.50,1500.25
                <br />
                14/01/2024,SALARY CREDIT,3500.00,1525.75
                <br />
                13/01/2024,SHOPEE*ONLINE SHOPPING,-89.90,1974.25
              </div>
            </CardContent>
          </Card>

          {/* Preview Table */}
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>データプレビュー</CardTitle>
                <CardDescription>アップロードされた取引データの最初の5件を表示しています</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">残高</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={`text-right ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          RM {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">RM {transaction.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleAnalyze} className="bg-[#0052CC] hover:bg-[#0052CC]/90">
                    分析を開始
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
