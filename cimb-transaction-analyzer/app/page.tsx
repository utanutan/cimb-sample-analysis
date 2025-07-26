"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, BarChart3, PieChart, TrendingUp, FileText, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0052CC] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CIMB取引分析</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            CIMB取引データを
            <span className="text-[#0052CC]">スマートに分析</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            CSVファイルをアップロードするだけで、あなたの支出パターンを自動分析。
            <br />
            カテゴリ別の集計やグラフで家計管理を効率化しましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="bg-[#0052CC] hover:bg-[#0052CC]/90 text-white px-8 py-3">
                <Upload className="w-5 h-5 mr-2" />
                今すぐ始める
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              <FileText className="w-5 h-5 mr-2" />
              サンプルを見る
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">主な機能</h3>
          <p className="text-gray-600 dark:text-gray-300">シンプルで直感的な操作で、あなたの家計管理をサポートします</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#0052CC]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-[#0052CC]" />
              </div>
              <CardTitle className="text-xl">簡単アップロード</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                CIMBのCSVファイルをドラッグ&ドロップするだけ。面倒な設定は一切不要です。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#00A1DE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-[#00A1DE]" />
              </div>
              <CardTitle className="text-xl">自動カテゴリ分類</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                取引内容を自動で分析し、食費、交通費、娯楽費などのカテゴリに分類します。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#FFC107]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#FFC107]" />
              </div>
              <CardTitle className="text-xl">視覚的な分析</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                グラフやチャートで支出パターンを可視化。家計の改善点が一目でわかります。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">使い方</h3>
            <p className="text-gray-600 dark:text-gray-300">3つのステップで簡単に始められます</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0052CC] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">CSVアップロード</h4>
              <p className="text-gray-600 dark:text-gray-300">
                CIMBからダウンロードした取引履歴CSVファイルをアップロード
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#00A1DE] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">自動分析</h4>
              <p className="text-gray-600 dark:text-gray-300">取引データを自動で分析し、カテゴリ別に分類</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#FFC107] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">結果確認</h4>
              <p className="text-gray-600 dark:text-gray-300">グラフやテーブルで支出パターンを確認し、家計を改善</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-[#0052CC]/5 to-[#00A1DE]/5 border-[#0052CC]/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-[#0052CC]" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">セキュリティについて</h3>
            <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              アップロードされたデータはブラウザ内でのみ処理され、サーバーに保存されることはありません。
              あなたの金融情報は完全にプライベートに保たれます。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 CIMB取引分析アプリ. プライバシーを重視した家計管理ツール</p>
        </div>
      </footer>
    </div>
  )
}
