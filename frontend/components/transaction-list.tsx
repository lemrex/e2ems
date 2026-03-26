
"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { DateRange } from "react-day-picker"

interface Transaction {
  id: number
  type: string
  amount: number
  category: string
  date: string
  description: string
}

interface TransactionListProps {
  filter: "all" | "income" | "expense"
  timeScope: 'current-month' | 'last-week' | 'last-two-weeks' | 'last-month' | 'custom' | 'all-time'
  customDateRange?: DateRange
  onUpdate: () => void
}

const PAGE_SIZE = 8

export default function TransactionList({ filter, timeScope, customDateRange, onUpdate }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setPage(1)
    fetchTransactions()
  }, [filter, timeScope, customDateRange?.from, customDateRange?.to]) // Proper dependencies

  const getDateRangeParams = () => {
    const now = new Date()
    
    switch (timeScope) {
      case 'current-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: lastDay.toISOString().split('T')[0]
        }
      }
      case 'last-week': {
        const lastWeek = new Date(now)
        lastWeek.setDate(now.getDate() - 7)
        return {
          startDate: lastWeek.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }
      }
      case 'last-two-weeks': {
        const twoWeeksAgo = new Date(now)
        twoWeeksAgo.setDate(now.getDate() - 14)
        return {
          startDate: twoWeeksAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }
      }
      case 'last-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          startDate: firstDay.toISOString().split('T')[0],
          endDate: lastDay.toISOString().split('T')[0]
        }
      }
      case 'custom': {
        if (customDateRange?.from) {
          return {
            startDate: customDateRange.from.toISOString().split('T')[0],
            endDate: customDateRange.to 
              ? customDateRange.to.toISOString().split('T')[0]
              : customDateRange.from.toISOString().split('T')[0]
          }
        }
        return null
      }
      case 'all-time':
      default:
        return null // No date filtering for all time
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      // Build URL with query parameters
      let url = "https://zenspend.onrender.com/api/transactions/"
      const params = new URLSearchParams()
      
      // Add type filter
      if (filter !== "all") {
        params.append("type", filter)
      }
      
      // Add date range based on selected time scope
      const dateRange = getDateRangeParams()
      if (dateRange) {
        params.append("startDate", dateRange.startDate)
        params.append("endDate", dateRange.endDate)
      }
      
      // Append params to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log("Fetching transactions with URL:", url) // For debugging

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch transactions")

      const json = await response.json()
      let data: Transaction[] = json.data.transactions

      // Sort by date (newest first)
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setTransactions(sorted)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `https://zenspend.onrender.com/api/transactions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) throw new Error()

      setTransactions((prev) => prev.filter((t) => t.id !== id))
      onUpdate()

      toast({
        title: "Deleted",
        description: "Transaction removed successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  /* 🔍 SEARCH FILTER */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) =>
      `${t.description} ${t.category} ${t.amount} ${new Date(t.date).toLocaleDateString()}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [transactions, search])

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE)

  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [search])

  const getTimeScopeDisplay = () => {
    const dateRange = getDateRangeParams()
    if (!dateRange) return "all time"
    
    const start = new Date(dateRange.startDate).toLocaleDateString()
    const end = new Date(dateRange.endDate).toLocaleDateString()
    
    if (start === end) return start
    
    switch (timeScope) {
      case 'current-month':
        return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      case 'last-week':
        return `last 7 days (${start} - ${end})`
      case 'last-two-weeks':
        return `last 14 days (${start} - ${end})`
      case 'last-month': {
        const date = new Date()
        date.setMonth(date.getMonth() - 1)
        return date.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
      case 'custom':
        return `${start} - ${end}`
      default:
        return "all time"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No transactions found</p>
        {timeScope !== 'all-time' && (
          <p className="text-sm mt-2">
            for {getTimeScopeDisplay()}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 🔍 Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by description, category, amount, or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Period indicator */}
      <div className="text-xs text-muted-foreground px-1">
        Showing transactions for: {getTimeScopeDisplay()}
      </div>

      {/* 📃 List */}
      <AnimatePresence>
        {paginatedTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-3 sm:p-4 group hover:bg-card/60"
          >
            {/* Mobile */}
            <div className="flex flex-col sm:hidden gap-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold truncate">
                    {transaction.description || transaction.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={deletingId === transaction.id}
                  onClick={() => handleDelete(transaction.id)}
                >
                  {deletingId === transaction.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <Badge
                    variant={transaction.type === "income" ? "default" : "destructive"}
                  >
                    {transaction.type}
                  </Badge>
                  <Badge variant="outline">{transaction.category}</Badge>
                </div>
                <span
                  className={`font-bold ${
                    transaction.type === "income"
                      ? "text-secondary"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-lg">
                    {transaction.description || transaction.category}
                  </p>
                  <Badge
                    variant={transaction.type === "income" ? "default" : "destructive"}
                  >
                    {transaction.type}
                  </Badge>
                  <Badge variant="outline">{transaction.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-2xl font-bold ${
                    transaction.type === "income"
                      ? "text-secondary"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>

                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={deletingId === transaction.id}
                  onClick={() => handleDelete(transaction.id)}
                >
                  {deletingId === transaction.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-2">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        </div>
      )}
    </div>
  )
}
