"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
  onUpdate: () => void
}

export default function TransactionList({ filter, onUpdate }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch("https://zenspend.onrender.com/api/transactions/", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch transactions")
      }

      const json = await response.json()

      // ✅ Extract array correctly
      let transactions: Transaction[] = json.data.transactions

      // ✅ Filter
      if (filter !== "all") {
        transactions = transactions.filter(
          (t) => t.type.toLowerCase() === filter
        )
      }

      // ✅ Sort (newest first) — no mutation
      const sorted = [...transactions].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setTransactions(sorted)
    } catch (error) {
      console.error("[v0] Fetch transactions error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load transactions",
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
      const response = await fetch(`https://zenspend.onrender.com/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to delete transaction")

      toast({
        title: "Deleted",
        description: "Transaction removed successfully",
      })

      setTransactions(transactions.filter((t) => t.id !== id))
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm mt-2">Start by adding your first transaction!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-4 group hover:bg-card/60 transition-all"
          >
            {/* Mobile Layout - Extra Small Screens */}
            <div className="flex flex-col xs:hidden gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight truncate">{transaction.description || transaction.category}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="rounded-lg flex-shrink-0 h-7 w-7 -mt-1"
                >
                  {deletingId === transaction.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"} className="rounded text-[10px] px-1.5 py-0">
                    {transaction.type}
                  </Badge>
                  <Badge variant="outline" className="rounded text-[10px] px-1.5 py-0">
                    {transaction.category}
                  </Badge>
                </div>
                <div
                  className={`text-lg font-bold whitespace-nowrap ${
                    transaction.type === "income" ? "text-secondary" : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>

            {/* Mobile Layout - Small Screens */}
            <div className="hidden xs:flex sm:hidden flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{transaction.description || transaction.category}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="rounded-lg flex-shrink-0 h-8 w-8"
                >
                  {deletingId === transaction.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"} className="rounded-lg text-xs">
                    {transaction.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-xs">
                    {transaction.category}
                  </Badge>
                </div>
                <div
                  className={`text-xl font-bold whitespace-nowrap ${
                    transaction.type === "income" ? "text-secondary" : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-semibold text-lg">{transaction.description || transaction.category}</h3>
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"} className="rounded-lg">
                    {transaction.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg">
                    {transaction.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`text-2xl font-bold ${
                    transaction.type === "income" ? "text-secondary" : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  )
}
