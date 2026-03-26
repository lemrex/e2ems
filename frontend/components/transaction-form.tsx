"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Loader2, CalendarIcon } from "lucide-react"

interface TransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const EXPENSE_CATEGORIES = [
  "Food",
  "Tech",
  "Entertainment",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Other",
  "Bank Charges",
  "Debt",
  "Utility",
  "Subscription",
  "Education",
  "Travel",
  "Insurance",
  "Gifts",
  "Charity",
]

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
]

export default function TransactionForm({
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        "https://zenspend.onrender.com/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            amount: Number.parseFloat(amount),
            category,
            date: date ? format(date, "yyyy-MM-dd") : null,
            description,
          }),
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err?.error || "Failed to add transaction")
      }

      onSuccess()
    } catch (error) {
      console.error("Add transaction error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Type */}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as "income" | "expense")}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Date</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-xl"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="w-auto p-0 sm:w-[350px]"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus

                /* 🔒 Disable future dates */
                disabled={(d) => d > new Date()}

                /* 📅 Month / Year dropdown */
                captionLayout="dropdown"
                fromYear={2015}
                toYear={new Date().getFullYear()}

                /* 🧠 Today shortcut */
                footer={
                  <div className="flex justify-end p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDate(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Add a note..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl resize-none"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl bg-transparent"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl glow-primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Transaction"
          )}
        </Button>
      </div>
    </form>
  )
}
