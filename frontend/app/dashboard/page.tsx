"use client"

import { useEffect, useState } from "react"
import { TRANSACTION_API } from "@/lib/api"
import { AUTH_API } from "@/lib/api"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus, 
  LogOut, 
  TrendingUp, 
  User,
  Calendar,
  ChevronDown
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import { formatCurrency } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Stats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  savingsRate?: number
  expenseByCategory?: Array<{ category: string; total: number }>
  dailyBreakdown?: Array<{ date: string; income: number; expense: number; net: number }>
  periodInfo?: {
    startDate: string
    endDate: string
    timeScope: string
  }
}

interface UserData {
  id: number
  email: string
  name?: string
  username?: string
}

type TimeScope = 'current-month' | 'last-week' | 'last-two-weeks' | 'last-month' | 'custom' | 'all-time'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState<UserData | null>(null)
  const [timeScope, setTimeScope] = useState<TimeScope>('current-month')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/signin")
      return
    }
    fetchUserInfo()
  }, [])

  useEffect(() => {
    if (timeScope !== 'custom' || customDateRange?.from) {
      fetchStats()
    }
  }, [refreshKey, timeScope, customDateRange])

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

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      let url = `${TRANSACTION_API}/api/transactions/stats`
      const params = getTimeScopeParams()
      const queryParams = new URLSearchParams()
      
      if (params.timeScope) {
        queryParams.append('timeScope', params.timeScope)
      }
      if (params.startDate) {
        queryParams.append('startDate', params.startDate)
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate)
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch stats")
      }

      const json = await response.json()
      setStats(json.data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${AUTH_API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const json = await response.json()
        setUser(json.data.user)
      }
    } catch (error) {
      // Silently fail - greeting will just not show
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    toast({ title: "Logged out successfully" })
    router.push("/")
  }

  const handleTransactionAdded = () => {
    setShowForm(false)
    setRefreshKey((prev) => prev + 1)
    toast({
      title: "Success! ✨",
      description: "Transaction added successfully",
    })
  }

  const handleTimeScopeChange = (value: TimeScope) => {
    setTimeScope(value)
    if (value !== 'custom') {
      setCustomDateRange(undefined)
      setRefreshKey((prev) => prev + 1)
    }
  }

  const handleCustomDateApply = () => {
    if (customDateRange?.from && customDateRange?.to) {
      setRefreshKey((prev) => prev + 1)
      setIsCalendarOpen(false)
    } else {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
    }
  }

  const getDisplayName = () => {
    if (user?.username) return user.username
    if (user?.email) return user.email.split("@")[0]
    return "there"
  }

  const getTimeScopeDisplay = () => {
    if (timeScope === 'custom' && stats?.periodInfo) {
      const start = new Date(stats.periodInfo.startDate)
      const end = new Date(stats.periodInfo.endDate)
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="glass border-b">
          <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ZenSpend
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Link href="/analytics">
                <Button variant="ghost" className="rounded-xl text-xs sm:text-sm">
                  <TrendingUp className="mr-1 sm:mr-2 w-4 h-4" />
                  <span className="hidden xs:inline">Analytics</span>
                  <span className="xs:hidden">Stats</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="rounded-xl">
                  <User className="mr-2 w-4 h-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="rounded-xl text-xs sm:text-sm">
                <LogOut className="mr-1 sm:mr-2 w-4 h-4" />
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">LogOut</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words">
                  Hi {getDisplayName()}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Welcome back to your financial dashboard
                </p>
              </div>
              
              {/* Time Scope Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={timeScope} onValueChange={handleTimeScopeChange}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                    <Calendar className="mr-2 w-4 h-4" />
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
                      <Button variant="outline" className="w-full sm:w-auto rounded-xl">
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

            {/* Time Scope Display */}
            {stats && !isLoading && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-sm text-muted-foreground mt-2"
              >
                Showing stats for: {getTimeScopeDisplay()}
              </motion.p>
            )}
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                    <ArrowUpRight className="mr-2 w-4 h-4 text-secondary" />
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary">
                    {isLoading ? "Loading..." : stats ? formatCurrency(stats.totalIncome) : "---"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                    <ArrowDownRight className="mr-2 w-4 h-4 text-destructive" />
                    Total Expense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-destructive">
                    {isLoading ? "Loading..." : stats ? formatCurrency(stats.totalExpense) : "---"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass border-2 rounded-2xl overflow-hidden glow-primary sm:col-span-2 md:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                    <Wallet className="mr-2 w-4 h-4 text-primary" />
                    Net Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${stats && stats.netBalance >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {isLoading ? "Loading..." : stats ? formatCurrency(stats.netBalance) : "---"}
                  </div>
                  {stats && stats.savingsRate !== undefined && Number(stats.savingsRate) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Savings rate: {stats.savingsRate}%
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Daily Breakdown Preview (Optional) */}
          {stats?.dailyBreakdown && stats.dailyBreakdown.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.35 }}
              className="mb-6"
            >
              <Card className="glass border-2 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.dailyBreakdown.slice(-4).map((day) => (
                      <div key={day.date} className="p-3 glass rounded-xl">
                        <p className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString()}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-secondary">+{formatCurrency(day.income)}</span>
                          <span className="text-xs text-destructive">-{formatCurrency(day.expense)}</span>
                        </div>
                        <p className={`text-sm font-bold mt-1 ${day.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          Net: {formatCurrency(day.net)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass border-2 rounded-2xl">
              {/* Header */}
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-xl sm:text-2xl">Transactions</CardTitle>
                <Button onClick={() => setShowForm(!showForm)} className="rounded-xl glow-primary w-full sm:w-auto">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Transaction
                </Button>
              </CardHeader>
              <CardContent>
                {showForm && (
                  <div className="mb-6 p-4 glass rounded-xl border">
                    <TransactionForm onSuccess={handleTransactionAdded} onCancel={() => setShowForm(false)} />
                  </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full sm:max-w-md grid-cols-3 rounded-xl glass">
                    <TabsTrigger value="all" className="rounded-lg text-xs sm:text-sm">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="income" className="rounded-lg text-xs sm:text-sm">
                      Income
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="rounded-lg text-xs sm:text-sm">
                      Expense
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <TransactionList 
                      key={refreshKey} 
                      filter="all" 
                      timeScope={timeScope}
                      customDateRange={customDateRange}
                      onUpdate={() => setRefreshKey((prev) => prev + 1)} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="income" className="mt-6">
                    <TransactionList
                      key={refreshKey}
                      filter="income"
                      timeScope={timeScope}
                      customDateRange={customDateRange}
                      onUpdate={() => setRefreshKey((prev) => prev + 1)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="expense" className="mt-6">
                    <TransactionList
                      key={refreshKey}
                      filter="expense"
                      timeScope={timeScope}
                      customDateRange={customDateRange}
                      onUpdate={() => setRefreshKey((prev) => prev + 1)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
