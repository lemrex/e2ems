

"use client"

import { useEffect, useState, useMemo } from "react"
import { TRANSACTION_API } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sparkles, 
  Target,
  Zap,
  DollarSign,
  Calendar,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart,
  ChevronRight,
  RefreshCw,
  Download,
  Share2,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  BarChart,
  Sun,
  Moon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"

interface Transaction {
  id: number
  type: string
  amount: number
  category: string
  date: string
  description: string
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface WeeklyData {
  weekStart: string
  income: number
  expense: number
  net: number
  transactionCount: number
}

interface MonthlyData {
  monthStart: string
  monthLabel: string
  income: number
  expense: number
  net: number
  transactionCount: number
}

interface DailyData {
  date: string
  income: number
  expense: number
  net: number
  transactionCount: number
}

interface ComparisonData {
  daily: {
    current: {
      label: string
      income: number
      expense: number
      net: number
      transactionCount: number
    }
    previous: {
      label: string
      income: number
      expense: number
      net: number
      transactionCount: number
    }
    change: {
      income: number
      expense: number
      net: number
      incomePct: number
      expensePct: number
      netPct: number
    }
  }
  weekly: {
    current: {
      label: string
      income: number
      expense: number
      net: number
      transactionCount: number
    }
    previous: {
      label: string
      income: number
      expense: number
      net: number
      transactionCount: number
    }
    change: {
      income: number
      expense: number
      net: number
      incomePct: number
      expensePct: number
      netPct: number
    }
  }
  monthly: {
    current: {
      label: string
      income: number
      expense: number
      net: number
      transactionCount: number
    }
    previous: {
      label: string
      income: number
      expense: number
      net: number
      transactionCount: number
    }
    change: {
      income: number
      expense: number
      net: number
      incomePct: number
      expensePct: number
      netPct: number
    }
  }
}

interface Stats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  savingsRate?: number
  expenseByCategory?: Array<{ category: string; total: number }>
  incomeByCategory?: Array<{ category: string; total: number }>
  dailyBreakdown?: Array<{ date: string; income: number; expense: number; net: number }>
  periodInfo?: {
    startDate: string
    endDate: string
    timeScope: string
  }
}

type TimeScope = 'current-month' | 'last-week' | 'last-two-weeks' | 'last-month' | 'custom' | 'all-time'

const VIBRANT_COLORS = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899",
  "#84cc16", "#3b82f6", "#f97316", "#8b5cf6", "#14b8a6", "#f43f5e"
]

const getRandomColor = () => VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)]

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [expenseData, setExpenseData] = useState<CategoryData[]>([])
  const [incomeData, setIncomeData] = useState<CategoryData[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  const [timeScope, setTimeScope] = useState<TimeScope>('current-month')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [showNetWorth, setShowNetWorth] = useState(true)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const { toast } = useToast()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Chart colors based on theme
  const chartColors = {
    grid: theme === "dark" ? "hsl(var(--border))" : "#e5e7eb",
    text: theme === "dark" ? "hsl(var(--muted-foreground))" : "#6b7280",
    tooltipBg: theme === "dark" ? "hsl(var(--card))" : "#ffffff",
    tooltipBorder: theme === "dark" ? "hsl(var(--border))" : "#e5e7eb",
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/signin")
      return
    }
    generateSparkles()
  }, [])

  useEffect(() => {
    if (timeScope !== 'custom' || customDateRange?.from) {
      fetchAllData()
    }
  }, [timeScope, customDateRange])

  const generateSparkles = () => {
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2
    }))
    setSparkles(newSparkles)
  }

  const getTimeScopeParams = () => {
    const params: { timeScope?: string; startDate?: string; endDate?: string } = {}
    
    if (timeScope === 'custom') {
      if (customDateRange?.from) {
        params.startDate = customDateRange.from.toISOString().split('T')[0]
        params.endDate = customDateRange.to 
          ? customDateRange.to.toISOString().split('T')[0]
          : customDateRange.from.toISOString().split('T')[0]
        params.timeScope = 'custom'
      }
    } else if (timeScope !== 'all-time') {
      params.timeScope = timeScope
    }
    
    return params
  }

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const timeParams = getTimeScopeParams()
      
      // Build query string
      const queryParams = new URLSearchParams()
      if (timeParams.timeScope) {
        queryParams.append('timeScope', timeParams.timeScope)
      }
      if (timeParams.startDate) {
        queryParams.append('startDate', timeParams.startDate)
      }
      if (timeParams.endDate) {
        queryParams.append('endDate', timeParams.endDate)
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

      // Fetch all data with time scope
      const [statsRes, transactionsRes, weeklyRes, monthlyRes, dailyRes, comparisonRes] = await Promise.all([
        fetch(`${TRANSACTION_API}/api/transactions/stats${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${TRANSACTION_API}/api/transactions/${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${TRANSACTION_API}/api/transactions/stat/weekly${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${TRANSACTION_API}/api/transactions/stat/monthly${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${TRANSACTION_API}/api/transactions/stat/daily${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${TRANSACTION_API}/api/transactions/stat/comparison${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!statsRes.ok) throw new Error("Failed to fetch stats")
      if (!transactionsRes.ok) throw new Error("Failed to fetch transactions")
      if (!weeklyRes.ok) throw new Error("Failed to fetch weekly data")
      if (!monthlyRes.ok) throw new Error("Failed to fetch monthly data")
      if (!dailyRes.ok) throw new Error("Failed to fetch daily data")
      if (!comparisonRes.ok) throw new Error("Failed to fetch comparison data")

      const [statsData, transactionsData, weeklyDataJson, monthlyDataJson, dailyDataJson, comparisonDataJson] = await Promise.all([
        statsRes.json(),
        transactionsRes.json(),
        weeklyRes.json(),
        monthlyRes.json(),
        dailyRes.json(),
        comparisonRes.json()
      ])

      setStats(statsData.data)
      setTransactions(transactionsData.data.transactions)
      setWeeklyData(weeklyDataJson.data.weekly || [])
      setMonthlyData(monthlyDataJson.data.monthly || [])
      setDailyData(dailyDataJson.data.daily || [])
      setComparisonData(comparisonDataJson.data)

      // Process category data from stats
// In fetchAllData function, replace the stats processing section:



      // Process category data from stats - FIX THIS SECTION
      if (statsData.data.expenseByCategory && statsData.data.expenseByCategory.length > 0) {
        setExpenseData(
          statsData.data.expenseByCategory.map((item: any, index: number) => ({
            name: item.category,
            value: Number(item.total),
            color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
          }))
        )
      } else {
        setExpenseData([]) // Clear if no data
      }

      if (statsData.data.incomeByCategory && statsData.data.incomeByCategory.length > 0) {
        setIncomeData(
          statsData.data.incomeByCategory.map((item: any, index: number) => ({
            name: item.category,
            value: Number(item.total),
            color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
          }))
        )
      } else {
        setIncomeData([]) // Clear if no data
      }

    } catch (error) {
      console.error("Fetch analytics error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeScopeChange = (value: TimeScope) => {
    setTimeScope(value)
    if (value !== 'custom') {
      setCustomDateRange(undefined)
    }
  }

  const handleCustomDateApply = () => {
    if (customDateRange?.from && customDateRange?.to) {
      setIsCalendarOpen(false)
    } else {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
    }
  }

  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0)
  const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  const formatChartData = (data: DailyData[] | WeeklyData[] | MonthlyData[]) => {
    return data.map((item) => ({
      name:
        "monthLabel" in item
          ? item.monthLabel
          : "weekStart" in item
          ? `Week ${new Date(item.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : new Date((item as DailyData).date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
      Income: item.income,
      Expense: item.expense,
      Net: item.net,
    }))
  }

  const formatComparisonData = () => {
    if (!comparisonData) return null

    return {
      dailyComparison: {
        current: comparisonData.daily.current,
        previous: comparisonData.daily.previous,
        incomeChange: comparisonData.daily.change.income,
        expenseChange: comparisonData.daily.change.expense,
        netChange: comparisonData.daily.change.net,
        incomePct: comparisonData.daily.change.incomePct,
        expensePct: comparisonData.daily.change.expensePct,
        netPct: comparisonData.daily.change.netPct
      },
      weeklyComparison: {
        current: comparisonData.weekly.current,
        previous: comparisonData.weekly.previous,
        incomeChange: comparisonData.weekly.change.income,
        expenseChange: comparisonData.weekly.change.expense,
        netChange: comparisonData.weekly.change.net,
        incomePct: comparisonData.weekly.change.incomePct,
        expensePct: comparisonData.weekly.change.expensePct,
        netPct: comparisonData.weekly.change.netPct
      },
      monthlyComparison: {
        current: comparisonData.monthly.current,
        previous: comparisonData.monthly.previous,
        incomeChange: comparisonData.monthly.change.income,
        expenseChange: comparisonData.monthly.change.expense,
        netChange: comparisonData.monthly.change.net,
        incomePct: comparisonData.monthly.change.incomePct,
        expensePct: comparisonData.monthly.change.expensePct,
        netPct: comparisonData.monthly.change.netPct
      }
    }
  }  

  const comparisonChartData = formatComparisonData()

  const radarData = useMemo(() => {
    const categories = [...new Set([...expenseData.map(e => e.name), ...incomeData.map(i => i.name)])]
    return categories.map(category => ({
      category,
      expense: expenseData.find(e => e.name === category)?.value || 0,
      income: incomeData.find(i => i.name === category)?.value || 0,
      fullMark: Math.max(...expenseData.map(e => e.value), ...incomeData.map(i => i.value)) * 1.2
    }))
  }, [expenseData, incomeData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { 
      style: "currency", 
      currency: "NGN",
      notation: amount > 1000000 ? "compact" : "standard"
    }).format(amount)
  }

  const getFinancialHealth = () => {
    if (savingsRate > 30) return { label: "Excellent", color: "#10b981", emoji: "🏆" }
    if (savingsRate > 20) return { label: "Great", color: "#84cc16", emoji: "✨" }
    if (savingsRate > 10) return { label: "Good", color: "#f59e0b", emoji: "👍" }
    return { label: "Needs Attention", color: "#ef4444", emoji: "⚠️" }
  }

  const health = getFinancialHealth()

  const getTimeScopeDisplay = () => {
    if (timeScope === 'custom' && customDateRange?.from && customDateRange?.to) {
      return `${customDateRange.from.toLocaleDateString()} - ${customDateRange.to.toLocaleDateString()}`
    }
    
    switch (timeScope) {
      case 'current-month':
        return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      case 'last-week':
        return 'Last 7 Days'
      case 'last-two-weeks':
        return 'Last 14 Days'
      case 'last-month': {
        const date = new Date()
        date.setMonth(date.getMonth() - 1)
        return date.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
      case 'all-time':
        return 'All Time'
      default:
        return ''
    }
  }

  // Mask net worth when showNetWorth is false
  const displayNetWorth = showNetWorth ? totalIncome - totalExpense : 0
  const maskedNetWorth = "•••••••"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Crunching numbers for {getTimeScopeDisplay()}...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse" />
      
      {/* Floating Elements */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/30 to-secondary/30"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Header */}
        <div className="glass border-b backdrop-blur-xl border-primary/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="rounded-xl group hover:bg-primary/10">
                    <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Badge variant="outline" className="border-primary/50 bg-primary/10">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Analytics Pro
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Time Scope Selector */}
                <div className="flex items-center gap-2">
                  <Select value={timeScope} onValueChange={handleTimeScopeChange}>
                    <SelectTrigger className="w-[180px] glass rounded-xl">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Current Month</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-two-weeks">Last Two Weeks</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                      <SelectItem value="all-time">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  {timeScope === 'custom' && (
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="rounded-xl">
                          <Calendar className="mr-2 w-4 h-4" />
                          {customDateRange?.from ? (
                            customDateRange.to ? (
                              <>
                                {customDateRange.from.toLocaleDateString()} -{" "}
                                {customDateRange.to.toLocaleDateString()}
                              </>
                            ) : (
                              customDateRange.from.toLocaleDateString()
                            )
                          ) : (
                            "Select dates"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <div className="p-4">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={customDateRange?.from}
                            selected={customDateRange}
                            onSelect={setCustomDateRange}
                            numberOfMonths={2}
                          />
                          <div className="flex justify-end mt-4">
                            <Button 
                              onClick={handleCustomDateApply}
                              disabled={!customDateRange?.from || !customDateRange?.to}
                            >
                              Apply Range
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                  Financial Insights
                </h1>
                <p className="text-muted-foreground text-lg">
                  Showing data for: <span className="font-semibold text-primary">{getTimeScopeDisplay()}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-xl p-2">
                  <Eye className="w-4 h-4" />
                  <Label htmlFor="net-worth-toggle" className="text-sm">Show Net Worth</Label>
                  <Switch
                    id="net-worth-toggle"
                    checked={showNetWorth}
                    onCheckedChange={setShowNetWorth}
                  />
                </div>
                <Button className="rounded-xl bg-gradient-to-r from-primary to-secondary">
                  <Zap className="w-4 h-4 mr-2" />
                  Insights
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="glass border-2 border-primary/20 rounded-2xl overflow-hidden group hover:border-primary/40 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {showNetWorth ? formatCurrency(displayNetWorth) : maskedNetWorth}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={savingsRate >= 0 ? "default" : "destructive"}
                        className={`${savingsRate >= 0 ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}
                      >
                        {savingsRate >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {savingsRate.toFixed(1)}% Savings Rate
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="glass border-2 border-green-500/20 rounded-2xl overflow-hidden group hover:border-green-500/40 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                      <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                    <p className="text-xs text-muted-foreground mt-2">Across {incomeData.length} categories</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="glass border-2 border-red-500/20 rounded-2xl overflow-hidden group hover:border-red-500/40 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                      <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                    <p className="text-xs text-muted-foreground mt-2">Across {expenseData.length} categories</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="glass border-2 border-amber-500/20 rounded-2xl overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Financial Health</CardTitle>
                      <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <Activity className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{health.emoji}</span>
                      <div>
                        <div className="text-xl font-bold" style={{ color: health.color }}>{health.label}</div>
                        <Progress value={savingsRate} className="h-2 mt-2" style={{ backgroundColor: `${health.color}20` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="glass rounded-xl p-1">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                  <LineChart className="w-4 h-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="comparison" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Comparison
                </TabsTrigger>
                <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Expense Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass border-2 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Expense Distribution</CardTitle>
                        <Badge variant="outline" className="border-red-500/50 text-red-600">
                          {expenseData.length} Categories
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {expenseData.length > 0 ? (
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {expenseData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [formatCurrency(Number(value)), "Expense Amount"]}
                                contentStyle={{
                                  backgroundColor: chartColors.tooltipBg,
                                  border: `1px solid ${chartColors.tooltipBorder}`,
                                  borderRadius: "12px",
                                  backdropFilter: "blur(12px)",
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                          <PieChartIcon className="w-16 h-16 mb-4 opacity-20" />
                          <p>No expense data available for this period</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Income Sources Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass border-2 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Income Sources</CardTitle>
                        <Badge variant="outline" className="border-green-500/50 text-green-600">
                          {incomeData.length} Sources
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {incomeData.length > 0 ? (
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={incomeData}>
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={chartColors.grid}
                                opacity={0.3}
                              />
                              <XAxis 
                                dataKey="name" 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                              />
                              <Tooltip
                                formatter={(value) => [formatCurrency(Number(value)), "Income Amount"]}
                                contentStyle={{
                                  backgroundColor: chartColors.tooltipBg,
                                  border: `1px solid ${chartColors.tooltipBorder}`,
                                  borderRadius: "12px",
                                  backdropFilter: "blur(12px)",
                                }}
                              />
                              <Bar 
                                dataKey="value" 
                                radius={[4, 4, 0, 0]}
                              >
                                {incomeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                          <BarChart className="w-16 h-16 mb-4 opacity-20" />
                          <p>No income data available for this period</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <Card className="glass border-2 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">Financial Trends</CardTitle>
                  <CardDescription>
                    Track your income, expenses, and net over time for {getTimeScopeDisplay()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="monthly">
                      {monthlyData.length > 0 ? (
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={formatChartData(monthlyData)}>
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={chartColors.grid}
                                opacity={0.3}
                              />
                              <XAxis 
                                dataKey="name" 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                              />
                              <Tooltip
                                formatter={(value, name) => {
                                  const labels = {
                                    "Income": "Monthly Income",
                                    "Expense": "Monthly Expense",
                                    "Net": "Monthly Net"
                                  }
                                  return [formatCurrency(Number(value)), labels[name as keyof typeof labels] || name]
                                }}
                                contentStyle={{
                                  backgroundColor: chartColors.tooltipBg,
                                  border: `1px solid ${chartColors.tooltipBorder}`,
                                  borderRadius: "12px",
                                  backdropFilter: "blur(12px)",
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="Income" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Expense" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Net" 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <LineChart className="w-16 h-16 mb-4 opacity-20" />
                          <p>No monthly data available for this period</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="weekly">
                      {weeklyData.length > 0 ? (
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={formatChartData(weeklyData)}>
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={chartColors.grid}
                                opacity={0.3}
                              />
                              <XAxis 
                                dataKey="name" 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                              />
                              <Tooltip
                                formatter={(value, name) => {
                                  const labels = {
                                    "Income": "Weekly Income",
                                    "Expense": "Weekly Expense",
                                    "Net": "Weekly Net"
                                  }
                                  return [formatCurrency(Number(value)), labels[name as keyof typeof labels] || name]
                                }}
                                contentStyle={{
                                  backgroundColor: chartColors.tooltipBg,
                                  border: `1px solid ${chartColors.tooltipBorder}`,
                                  borderRadius: "12px",
                                  backdropFilter: "blur(12px)",
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="Income" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Expense" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Net" 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <LineChart className="w-16 h-16 mb-4 opacity-20" />
                          <p>No weekly data available for this period</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="daily">
                      {dailyData.length > 0 ? (
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={formatChartData(dailyData.slice(-14))}>
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={chartColors.grid}
                                opacity={0.3}
                              />
                              <XAxis 
                                dataKey="name" 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis 
                                stroke={chartColors.text}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                              />
                              <Tooltip
                                formatter={(value, name) => {
                                  const labels = {
                                    "Income": "Daily Income",
                                    "Expense": "Daily Expense",
                                    "Net": "Daily Net"
                                  }
                                  return [formatCurrency(Number(value)), labels[name as keyof typeof labels] || name]
                                }}
                                contentStyle={{
                                  backgroundColor: chartColors.tooltipBg,
                                  border: `1px solid ${chartColors.tooltipBorder}`,
                                  borderRadius: "12px",
                                  backdropFilter: "blur(12px)",
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="Income" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Expense" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Net" 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <LineChart className="w-16 h-16 mb-4 opacity-20" />
                          <p>No daily data available for this period</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card className="glass border-2 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">Period Comparison</CardTitle>
                  <CardDescription>
                    Compare financial performance across different time periods for {getTimeScopeDisplay()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="daily" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="daily">Daily Comparison</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly Comparison</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly Comparison</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="daily">
                      {comparisonChartData?.dailyComparison ? (
                        <>
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Today Stats */}
                            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Today
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(comparisonChartData.dailyComparison.current.net)}</div>
                                    <div className="text-sm text-muted-foreground">Net</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold text-green-600">+{formatCurrency(comparisonChartData.dailyComparison.current.income)}</div>
                                      <div className="text-xs text-muted-foreground">Income</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-red-600">-{formatCurrency(comparisonChartData.dailyComparison.current.expense)}</div>
                                      <div className="text-xs text-muted-foreground">Expense</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {comparisonChartData.dailyComparison.current.transactionCount} transactions
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Yesterday Stats */}
                            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Yesterday
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(comparisonChartData.dailyComparison.previous.net)}</div>
                                    <div className="text-sm text-muted-foreground">Net</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold text-green-600">+{formatCurrency(comparisonChartData.dailyComparison.previous.income)}</div>
                                      <div className="text-xs text-muted-foreground">Income</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-red-600">-{formatCurrency(comparisonChartData.dailyComparison.previous.expense)}</div>
                                      <div className="text-xs text-muted-foreground">Expense</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {comparisonChartData.dailyComparison.previous.transactionCount} transactions
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Daily Comparison Chart */}
                          <div className="h-[300px] mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
                                data={[
                                  {
                                    name: "Today",
                                    Income: comparisonChartData.dailyComparison.current.income,
                                    Expense: comparisonChartData.dailyComparison.current.expense,
                                    Net: comparisonChartData.dailyComparison.current.net,
                                  },
                                  {
                                    name: "Yesterday",
                                    Income: comparisonChartData.dailyComparison.previous.income,
                                    Expense: comparisonChartData.dailyComparison.previous.expense,
                                    Net: comparisonChartData.dailyComparison.previous.net,
                                  },
                                ]}
                              >
                                <CartesianGrid 
                                  strokeDasharray="3 3" 
                                  stroke={chartColors.grid}
                                  opacity={0.3}
                                />
                                <XAxis 
                                  dataKey="name" 
                                  stroke={chartColors.text}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke={chartColors.text}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                                />
                                <Tooltip
                                  formatter={(value, name) => {
                                    const labels = {
                                      "Income": "Daily Income",
                                      "Expense": "Daily Expense",
                                      "Net": "Daily Net"
                                    }
                                    return [formatCurrency(Number(value)), labels[name as keyof typeof labels] || name]
                                  }}
                                  contentStyle={{
                                    backgroundColor: chartColors.tooltipBg,
                                    border: `1px solid ${chartColors.tooltipBorder}`,
                                    borderRadius: "12px",
                                    backdropFilter: "blur(12px)",
                                  }}
                                />
                                <Legend />
                                <Bar 
                                  dataKey="Income" 
                                  fill="#10b981" 
                                  radius={[4, 4, 0, 0]}
                                  name="Daily Income"
                                />
                                <Bar 
                                  dataKey="Expense" 
                                  fill="#ef4444" 
                                  radius={[4, 4, 0, 0]}
                                  name="Daily Expense"
                                />
                                <Bar 
                                  dataKey="Net" 
                                  fill="#8b5cf6" 
                                  radius={[4, 4, 0, 0]}
                                  name="Daily Net"
                                />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Change Indicators */}
                          <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.dailyComparison.incomeChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.dailyComparison.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparisonChartData.dailyComparison.incomeChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.dailyComparison.incomeChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Income Change</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.dailyComparison.expenseChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-red-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-green-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.dailyComparison.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {comparisonChartData.dailyComparison.expenseChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.dailyComparison.expenseChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Expense Change</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.dailyComparison.netChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.dailyComparison.netChange >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                  {comparisonChartData.dailyComparison.netChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.dailyComparison.netChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Net Change</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                          <p>Insufficient daily data for comparison in this period</p>
                          <p className="text-sm mt-2">Need at least 2 days of data</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="weekly">
                      {comparisonChartData?.weeklyComparison ? (
                        <>
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* This Week Stats */}
                            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  This Week
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(comparisonChartData.weeklyComparison.current.net)}</div>
                                    <div className="text-sm text-muted-foreground">Net</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold text-green-600">+{formatCurrency(comparisonChartData.weeklyComparison.current.income)}</div>
                                      <div className="text-xs text-muted-foreground">Income</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-red-600">-{formatCurrency(comparisonChartData.weeklyComparison.current.expense)}</div>
                                      <div className="text-xs text-muted-foreground">Expense</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {comparisonChartData.weeklyComparison.current.transactionCount} transactions
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Last Week Stats */}
                            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Last Week
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(comparisonChartData.weeklyComparison.previous.net)}</div>
                                    <div className="text-sm text-muted-foreground">Net</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold text-green-600">+{formatCurrency(comparisonChartData.weeklyComparison.previous.income)}</div>
                                      <div className="text-xs text-muted-foreground">Income</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-red-600">-{formatCurrency(comparisonChartData.weeklyComparison.previous.expense)}</div>
                                      <div className="text-xs text-muted-foreground">Expense</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {comparisonChartData.weeklyComparison.previous.transactionCount} transactions
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Weekly Comparison Chart */}
                          <div className="h-[300px] mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
                                data={[
                                  {
                                    name: "This Week",
                                    Income: comparisonChartData.weeklyComparison.current.income,
                                    Expense: comparisonChartData.weeklyComparison.current.expense,
                                    Net: comparisonChartData.weeklyComparison.current.net,
                                  },
                                  {
                                    name: "Last Week",
                                    Income: comparisonChartData.weeklyComparison.previous.income,
                                    Expense: comparisonChartData.weeklyComparison.previous.expense,
                                    Net: comparisonChartData.weeklyComparison.previous.net,
                                  },
                                ]}
                              >
                                <CartesianGrid 
                                  strokeDasharray="3 3" 
                                  stroke={chartColors.grid}
                                  opacity={0.3}
                                />
                                <XAxis 
                                  dataKey="name" 
                                  stroke={chartColors.text}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke={chartColors.text}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                                />
                                <Tooltip
                                  formatter={(value, name) => {
                                    const labels = {
                                      "Income": "Weekly Income",
                                      "Expense": "Weekly Expense",
                                      "Net": "Weekly Net"
                                    }
                                    return [formatCurrency(Number(value)), labels[name as keyof typeof labels] || name]
                                  }}
                                  contentStyle={{
                                    backgroundColor: chartColors.tooltipBg,
                                    border: `1px solid ${chartColors.tooltipBorder}`,
                                    borderRadius: "12px",
                                    backdropFilter: "blur(12px)",
                                  }}
                                />
                                <Legend />
                                <Bar 
                                  dataKey="Income" 
                                  fill="#10b981" 
                                  radius={[4, 4, 0, 0]}
                                  name="Weekly Income"
                                />
                                <Bar 
                                  dataKey="Expense" 
                                  fill="#ef4444" 
                                  radius={[4, 4, 0, 0]}
                                  name="Weekly Expense"
                                />
                                <Bar 
                                  dataKey="Net" 
                                  fill="#8b5cf6" 
                                  radius={[4, 4, 0, 0]}
                                  name="Weekly Net"
                                />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Change Indicators */}
                          <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.weeklyComparison.incomeChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.weeklyComparison.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparisonChartData.weeklyComparison.incomeChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.weeklyComparison.incomeChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Income Change</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.weeklyComparison.expenseChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-red-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-green-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.weeklyComparison.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {comparisonChartData.weeklyComparison.expenseChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.weeklyComparison.expenseChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Expense Change</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.weeklyComparison.netChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.weeklyComparison.netChange >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                  {comparisonChartData.weeklyComparison.netChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.weeklyComparison.netChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Net Change</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                          <p>Insufficient weekly data for comparison in this period</p>
                          <p className="text-sm mt-2">Need at least 2 weeks of data</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="monthly">
                      {comparisonChartData?.monthlyComparison ? (
                        <>
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* This Month Stats */}
                            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  This Month
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(comparisonChartData.monthlyComparison.current.net)}</div>
                                    <div className="text-sm text-muted-foreground">Net</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold text-green-600">+{formatCurrency(comparisonChartData.monthlyComparison.current.income)}</div>
                                      <div className="text-xs text-muted-foreground">Income</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-red-600">-{formatCurrency(comparisonChartData.monthlyComparison.current.expense)}</div>
                                      <div className="text-xs text-muted-foreground">Expense</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {comparisonChartData.monthlyComparison.current.transactionCount} transactions
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Last Month Stats */}
                            <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Last Month
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-2xl font-bold">{formatCurrency(comparisonChartData.monthlyComparison.previous.net)}</div>
                                    <div className="text-sm text-muted-foreground">Net</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold text-green-600">+{formatCurrency(comparisonChartData.monthlyComparison.previous.income)}</div>
                                      <div className="text-xs text-muted-foreground">Income</div>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-red-600">-{formatCurrency(comparisonChartData.monthlyComparison.previous.expense)}</div>
                                      <div className="text-xs text-muted-foreground">Expense</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {comparisonChartData.monthlyComparison.previous.transactionCount} transactions
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Monthly Comparison Chart */}
                          <div className="h-[300px] mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
                                data={[
                                  {
                                    name: "This Month",
                                    Income: comparisonChartData.monthlyComparison.current.income,
                                    Expense: comparisonChartData.monthlyComparison.current.expense,
                                    Net: comparisonChartData.monthlyComparison.current.net,
                                  },
                                  {
                                    name: "Last Month",
                                    Income: comparisonChartData.monthlyComparison.previous.income,
                                    Expense: comparisonChartData.monthlyComparison.previous.expense,
                                    Net: comparisonChartData.monthlyComparison.previous.net,
                                  },
                                ]}
                              >
                                <CartesianGrid 
                                  strokeDasharray="3 3" 
                                  stroke={chartColors.grid}
                                  opacity={0.3}
                                />
                                <XAxis 
                                  dataKey="name" 
                                  stroke={chartColors.text}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke={chartColors.text}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(value) => formatCurrency(value).replace('NGN', '₦')}
                                />
                                <Tooltip
                                  formatter={(value, name) => {
                                    const labels = {
                                      "Income": "Monthly Income",
                                      "Expense": "Monthly Expense",
                                      "Net": "Monthly Net"
                                    }
                                    return [formatCurrency(Number(value)), labels[name as keyof typeof labels] || name]
                                  }}
                                  contentStyle={{
                                    backgroundColor: chartColors.tooltipBg,
                                    border: `1px solid ${chartColors.tooltipBorder}`,
                                    borderRadius: "12px",
                                    backdropFilter: "blur(12px)",
                                  }}
                                />
                                <Legend />
                                <Bar 
                                  dataKey="Income" 
                                  fill="#10b981" 
                                  radius={[4, 4, 0, 0]}
                                  name="Monthly Income"
                                />
                                <Bar 
                                  dataKey="Expense" 
                                  fill="#ef4444" 
                                  radius={[4, 4, 0, 0]}
                                  name="Monthly Expense"
                                />
                                <Bar 
                                  dataKey="Net" 
                                  fill="#8b5cf6" 
                                  radius={[4, 4, 0, 0]}
                                  name="Monthly Net"
                                />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Change Indicators */}
                          <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.monthlyComparison.incomeChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.monthlyComparison.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {comparisonChartData.monthlyComparison.incomeChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.monthlyComparison.incomeChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Income Change</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.monthlyComparison.expenseChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-red-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-green-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.monthlyComparison.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {comparisonChartData.monthlyComparison.expenseChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.monthlyComparison.expenseChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Expense Change</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {comparisonChartData.monthlyComparison.netChange >= 0 ? (
                                  <TrendingUpIcon className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <TrendingDownIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`font-semibold ${comparisonChartData.monthlyComparison.netChange >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                  {comparisonChartData.monthlyComparison.netChange >= 0 ? '+' : ''}{formatCurrency(comparisonChartData.monthlyComparison.netChange)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">Net Change</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                          <p>Insufficient monthly data for comparison in this period</p>
                          <p className="text-sm mt-2">Need at least 2 months of data</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="glass border-2 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Advanced Insights
                  </CardTitle>
                  <CardDescription>
                    Deep financial analysis and predictive insights for {getTimeScopeDisplay()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-primary/10"
                      />
                      <div className="relative z-10 p-8">
                        <Sparkles className="w-24 h-24 mx-auto mb-6 text-primary/30" />
                        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          Coming Soon
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                          We're working on advanced AI-powered insights that will provide personalized 
                          financial recommendations, spending predictions, and optimization strategies 
                          tailored specifically for you based on your {getTimeScopeDisplay()} data.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-medium">Powered by AI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="glass border-2 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="text-xl">Quick Insights for {getTimeScopeDisplay()}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold">Top Income Source</div>
                        <div className="text-2xl font-bold mt-1">
                          {incomeData.length > 0 ? incomeData[0]?.name : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {incomeData.length > 0 ? formatCurrency(incomeData[0]?.value) : "No data"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-semibold">Largest Expense</div>
                        <div className="text-2xl font-bold mt-1">
                          {expenseData.length > 0 ? expenseData[0]?.name : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {expenseData.length > 0 ? formatCurrency(expenseData[0]?.value) : "No data"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">Savings Goal Progress</div>
                        <div className="text-2xl font-bold mt-1">
                          {savingsRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {savingsRate >= 20 ? "Excellent progress!" : "Room for improvement"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
