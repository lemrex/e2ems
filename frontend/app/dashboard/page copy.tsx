

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpRight, ArrowDownRight, Wallet, Plus, LogOut, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import { formatCurrency } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface Stats {
  totalIncome: number
  totalExpense: number
  netBalance: number
}

interface User {
  id: number
  email: string
  name?: string
  username?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState<User | null>(null) // Added user state
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/signin")
      return
    }
    fetchStats()
    fetchUserInfo() // Fetch user information on mount
  }, [refreshKey])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch("https://zenspend.onrender.com/api/transactions/stats", {
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
      const response = await fetch("https://zenspend.onrender.com/api/auth/me", {
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

  const getDisplayName = () => {
    if (user?.username) return user.username
    if (user?.email) return user.email.split("@")[0]
    return "there"
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words">
              Hi {getDisplayName()}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {"Welcome back to your financial dashboard"}
            </p>
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
                    {stats ? formatCurrency(stats.totalIncome) : "---"}
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
                    {stats ? formatCurrency(stats.totalExpense) : "---"}
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
                    {stats ? formatCurrency(stats.netBalance) : "---"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

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
                    <TransactionList key={refreshKey} filter="all" onUpdate={() => setRefreshKey((prev) => prev + 1)} />
                  </TabsContent>
                  <TabsContent value="income" className="mt-6">
                    <TransactionList
                      key={refreshKey}
                      filter="income"
                      onUpdate={() => setRefreshKey((prev) => prev + 1)}
                    />
                  </TabsContent>
                  <TabsContent value="expense" className="mt-6">
                    <TransactionList
                      key={refreshKey}
                      filter="expense"
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
