"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, HelpCircle, FileDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Papa from 'papaparse'

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
  category: string
  icon: string
  transactionDetails: TransactionDetails
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

  // 取引詳細をセグメントに分割する関数
  function parseTransactionDetails(description: string): TransactionDetails {
    // 「|」で分割
    const segments = description.split('|')
    
    // 基本的なセグメント構造
    const result: TransactionDetails = {
      transactionType: segments[0]?.trim() || '',          // セグメント1: 取引タイプ/メソッド
      merchantInfo: segments[1]?.trim() || '',             // セグメント2: 店舗/サービス名と場所
      referenceNumber: segments[2]?.trim() || '',          // セグメント3: 参照番号
      merchantName: segments[3]?.trim() || '',             // セグメント4: 店舗名詳細
      location: segments[4]?.trim() || '',                 // セグメント5: 場所情報
      paymentMethod: segments[5]?.trim() || ''             // セグメント6: 支払い方法
    }
    
    return result
  }

  // カテゴリを決定する関数
  function determineCategory(description: string, segments: TransactionDetails): string {
    const type = segments.transactionType?.toLowerCase() || ''
    const merchant = segments.merchantName?.toLowerCase() || ''
    
    if (type.includes('atm') || type.includes('withdrawal')) {
      return 'cash'
    } 
    else if (type.includes('credit interest') || type.includes('ibg credit')) {
      return 'income'
    }
    else if (type.includes('duitnow to account') || type.includes('i-funds')) {
      return 'transfer'
    }
    else if (type.includes('debit card fee')) {
      return 'fees'
    }
    else if (merchant.includes('grocer') || 
            merchant.includes('7-eleven') || 
            merchant.includes('familymart')) {
      return 'groceries'
    }
    else if (merchant.includes('eats') || 
            merchant.includes('rasa viet') || 
            merchant.includes('maison') || 
            merchant.includes('tonkatsu') || 
            merchant.includes('tao bin') || 
            merchant.includes('pizzalab') ||
            merchant.includes('koppiku')) {
      return 'dining'
    }
    else if (merchant.includes('pnh malaysia') || merchant.includes('pet')) {
      return 'pets'
    }
    else if (type.includes('i-payment') && description.toLowerCase().includes('hotlink')) {
      return 'utilities'
    }
    else if (merchant.includes('uniqlo') || 
            merchant.includes('muji') || 
            merchant.includes('urban revivo')) {
      return 'shopping'
    }
    
    return 'misc'
  }

  // アイコンを決定する関数
  const determineIcon = (description: string, segments: any) => {
    const type = segments.transactionType?.toLowerCase() || ''
    const merchant = segments.merchantName?.toLowerCase() || ''
    const descLower = description.toLowerCase()
    
    if (type.includes('atm') || type.includes('withdrawal')) {
      return 'cash'
    } 
    else if (type.includes('duitnow') && (merchant.includes('koppiku') || merchant.includes('coffee'))) {
      return 'coffee'
    }
    else if (type.includes('duitnow to account') || type.includes('i-funds tr')) {
      return 'transfer'
    }
    else if (type.includes('credit interest') || type.includes('ibg credit')) {
      return 'income'
    }
    else if (type.includes('debit card fee')) {
      return 'fee'
    }
    else if (type.includes('i-payment') && descLower.includes('hotlink')) {
      return 'phone'
    }
    else if (type.includes('i-payment') && descLower.includes('wise')) {
      return 'transfer'
    }
    
    if (merchant.includes('grocer') || 
        merchant.includes('7-eleven') || 
        merchant.includes('familymart')) {
      return 'grocery'
    }
    else if (merchant.includes('eats') || 
            merchant.includes('rasa viet') || 
            merchant.includes('maison') || 
            merchant.includes('tonkatsu') || 
            merchant.includes('tao bin') || 
            merchant.includes('pizzalab')) {
      return 'food'
    }
    else if (merchant.includes('pnh malaysia') || merchant.includes('pet')) {
      return 'pet'
    }
    else if (merchant.includes('uniqlo') || 
            merchant.includes('muji') || 
            merchant.includes('urban revivo')) {
      return 'shopping'
    }
    
    return 'misc'
  }

  const processFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // ファイル読み込みの準備
      const reader = new FileReader()
      
      reader.onload = (e) => {
        // 中間進捗更新
        setUploadProgress(50)
        
        try {
          const csvData = e.target?.result as string
          
          // Papa Parseを使用してCSVをパース
          Papa.parse<Record<string, string>>(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              // パース完了
              setUploadProgress(75)
              
              const parsedTransactions: Transaction[] = []
              let count = 1
              
              // CSVデータを処理
              results.data.forEach((row: any) => {
                try {
                  // CSVデータを整形
                  const date = row.Date
                  const description = row['Transaction Details']?.replace(/"/g, '') || ''
                  
                  // 残高を取得
                  const balance = parseFloat((row.Balance || '0').replace(/[^\d.-]/g, '').replace(/MYR/g, ''))
                  
                  // "Money In"と"Money Out"を処理
                  let amount = 0
                  if (row['Money In'] && row['Money In'].trim() !== '') {
                    amount = parseFloat(row['Money In'].replace(/[^\d.-]/g, '').replace(/MYR/g, ''))
                  } else if (row['Money Out'] && row['Money Out'].trim() !== '') {
                    amount = -parseFloat(row['Money Out'].replace(/[^\d.-]/g, '').replace(/MYR/g, ''))
                  }
                  
                  // 日付形式を変換（DD-Month-YYYY → YYYY-MM-DD）
                  const dateParts = date.replace(/"/g, '').split('-')
                  const day = dateParts[0]?.trim()
                  const monthName = dateParts[1]?.trim()
                  const year = dateParts[2]?.trim()
                  
                  // 月名を数字に変換
                  const monthNames: {[key: string]: string} = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                  }
                  
                  const month = monthNames[monthName] || '01'
                  const formattedDate = `${year}-${month}-${day?.padStart(2, '0')}`
                  
                  // トランザクション詳細をセグメントに分割
                  const segments = parseTransactionDetails(description)
                  
                  // カテゴリーとアイコンを決定
                  const category = determineCategory(description, segments)
                  const icon = determineIcon(description, segments)
                  
                  // トランザクションオブジェクトを構築
                  const transaction: Transaction = {
                    date: formattedDate,
                    description: description,
                    amount: parseFloat(amount.toFixed(2)),
                    balance: balance,
                    category: category,
                    icon: icon,
                    transactionDetails: segments
                  }
                  
                  parsedTransactions.push(transaction)
                  count++
                } catch (rowError) {
                  console.error('行の処理中にエラーが発生しました:', rowError)
                }
              })
              
              // 日付順（新しい順）にソート
              parsedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              
              // 結果をセット
              setTransactions(parsedTransactions)
              setUploadProgress(100)
              setUploading(false)
            },
            error: (error: Error) => {
              console.error('CSV解析エラー:', error)
              setError(`CSVの解析中にエラーが発生しました: ${error.message}`)
              setUploading(false)
            }
          })
        } catch (parseError) {
          console.error('ファイル処理エラー:', parseError)
          setError('CSVファイルの処理中にエラーが発生しました')
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        setError('ファイルの読み込み中にエラーが発生しました')
        setUploading(false)
      }
      
      // ファイル読み込み開始
      reader.readAsText(file)
      setUploadProgress(25)
    } catch (err) {
      console.error('エラー:', err)
      setError('ファイルの処理中にエラーが発生しました')
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
              <div className="w-8 h-8 bg-[#E60000] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="ml-2 text-[#E60000] font-medium">アップロード</span>
            </div>
            <div className="w-16 h-0.5 bg-[#E60000]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#FFCCCC] text-[#E60000] rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-[#E60000]/70">分析</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* CIMB Click CSV Download Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                CIMB ClickからCSVをダウンロードする方法
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="download-guide">
                  <AccordionTrigger>ダウンロード手順を表示</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium text-base mb-2 flex items-center">
                          <FileDown className="w-4 h-4 mr-2 text-[#E60000]" /> CIMB Clickでの取引履歴CSVダウンロード手順
                        </h3>
                        <ol className="list-decimal pl-5 space-y-3">
                          <li>
                            <span className="font-medium">CIMB Clickにログイン:</span>
                            <p>CIMB Clickウェブサイト（<a href="https://www.cimbclicks.com.my" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">www.cimbclicks.com.my</a>）にアクセスし、ログインします。</p>
                          </li>
                          <li>
                            <span className="font-medium">口座詳細を表示:</span>
                            <p>「口座の概要」セクションから、取引履歴をダウンロードしたい口座をクリックします。</p>
                          </li>
                          <li>
                            <span className="font-medium">取引履歴を選択:</span>
                            <p>「取引履歴」または「Account Statement」のタブを選択します。</p>
                          </li>
                          <li>
                            <span className="font-medium">期間を選択:</span>
                            <p>取引履歴をダウンロードしたい期間を選択します（例：過去1ヶ月、3ヶ月、特定の日付範囲など）。</p>
                          </li>
                          <li>
                            <span className="font-medium">CSVとしてダウンロード:</span>
                            <p>「ダウンロード」または「Export」ボタンをクリックし、出力形式として「CSV」を選択します。</p>
                          </li>
                          <li>
                            <span className="font-medium">ファイルを保存:</span>
                            <p>ダウンロードしたCSVファイルをコンピュータに保存します。このファイルをこのアプリケーションにアップロードしてください。</p>
                          </li>
                        </ol>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 text-xs">※ CIMB Clickのインターフェースは更新される場合があります。最新のナビゲーション方法については、CIMBサポートセンターにお問い合わせください。</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
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
                  dragActive ? "border-[#E60000] bg-[#E60000]/5" : "border-gray-300 hover:border-[#E60000]/50"
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
                <CardDescription>アップロードされた取引データの直近5件（全{transactions.length}件）を表示しています</CardDescription>
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
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <span className="font-medium">{transaction.transactionDetails.transactionType}</span>
                              {transaction.category && (
                                <span className="text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                  {transaction.category} {transaction.icon && `• ${transaction.icon}`}
                                </span>
                              )}
                            </div>
                            
                            {transaction.transactionDetails.merchantName && (
                              <div className="text-sm">
                                <span className="font-semibold">店舗: </span>
                                <span>{transaction.transactionDetails.merchantName}</span>
                              </div>
                            )}
                            
                            {transaction.transactionDetails.location && (
                              <div className="text-sm text-gray-600">
                                <span className="font-semibold">場所: </span>
                                <span>{transaction.transactionDetails.location}</span>
                              </div>
                            )}
                            
                            {transaction.transactionDetails.referenceNumber && (
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold">参照番号: </span>
                                <span>{transaction.transactionDetails.referenceNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
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
                  <Button onClick={handleAnalyze} className="bg-[#E60000] hover:bg-[#E60000]/90" disabled={transactions.length === 0 || uploading}>
                    分析に進む
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
