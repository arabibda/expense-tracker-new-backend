import { useEffect, useState } from "react";
import { LiaArrowDownSolid, LiaArrowUpSolid } from "react-icons/lia";
import { FiSearch } from "react-icons/fi";
import { Header } from '../Components/Header'
import { getUserId } from '../../utils/auth'
import { API_BASE_URL } from '../../utils/api'

type Income = {
  _id: string
  incomeTitle: string
  amount: number
  date: string
  category: string
}

type Expense = {
  _id: string
  expenseTitle: string
  amount: number
  date: string
  category: string
}

type Transaction = {
  id: string
  title: string
  amount: number
  date: string
  category: string
  type: "income" | "expense"
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)

export const Dashboard = () => {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const userId = getUserId()
        if (!userId) {
          throw new Error("Your session has expired. Please sign in again.")
        }

        const query = `?userId=${encodeURIComponent(userId)}`
        const [incomeResponse, expenseResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/incomes${query}`),
          fetch(`${API_BASE_URL}/api/auth/expenses${query}`),
        ])
        const [incomeData, expenseData] = await Promise.all([
          incomeResponse.json(),
          expenseResponse.json(),
        ])

        if (!incomeResponse.ok || !expenseResponse.ok) {
          throw new Error(incomeData.message || expenseData.message || "Unable to load transactions.")
        }

        setIncomes(incomeData.incomes)
        setExpenses(expenseData.expenses)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load transactions.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const totalIncome = incomes.reduce((total, income) => total + Number(income.amount), 0)
  const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0)
  const currentBalance = totalIncome - totalExpenses
  const transactions: Transaction[] = [
    ...incomes.map((income) => ({
      id: income._id,
      title: income.incomeTitle,
      amount: Number(income.amount),
      date: income.date,
      category: income.category,
      type: "income" as const,
    })),
    ...expenses.map((expense) => ({
      id: expense._id,
      title: expense.expenseTitle,
      amount: -Number(expense.amount),
      date: expense.date,
      category: expense.category,
      type: "expense" as const,
    })),
  ]
  const filteredTransactions = transactions.filter(({ title, category }) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return title.toLowerCase().includes(query) || category.toLowerCase().includes(query)
  })
 
  return(
    <div className="flex flex-col h-screen overflow-hidden">
    <div className="shrink-0 min-h-64 bg-gradient-to-b from-[#6453d3] to-[#4530b3] ">
         <Header />
        <div className="flex flex-col items-center justify-center text-center gap-2 relative top-8">
              <h4 className="text-sm font-medium uppercase tracking-wide text-white/80">Current Balance</h4>
              <h1 className="text-4xl font-extrabold text-white drop-shadow-sm">{formatAmount(currentBalance)}</h1>
        </div>
    </div>
    <div className="flex-1 flex flex-col overflow-hidden bg-[#dbe9f6] relative -top-8 rounded-t-3xl px-4 pt-6 pb-8">
         <div className="shrink-0 income-exp grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                      <LiaArrowDownSolid className="h-6 w-6" />
                  </span>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-slate-500">
                      <span>Income</span>
                     
                  </div>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-indigo-900">{formatAmount(totalIncome)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <LiaArrowUpSolid className="h-6 w-6" />
                  </span>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-slate-500">
                      <span>Expenses</span>
                     
                  </div>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-indigo-900">{formatAmount(totalExpenses)}</p>
              </div>
         </div>
             <h2 className="shrink-0 text-xl font-semibold text-seconday my-4">Transactions</h2>
             <div className="relative mb-4">
               <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
               <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search transactions..." className="w-full rounded-2xl border border-slate-100 bg-white p-3 pl-10 shadow-sm" />
             </div>
             <div className="transactions flex-1 overflow-y-auto pb-24">
                <ul className="flex flex-col gap-3">
                {isLoading ? <li className="rounded-2xl bg-white p-4 text-sm text-slate-500">Loading transactions...</li> : null}
                {error ? <li className="rounded-2xl bg-white p-4 text-sm text-red-500">{error}</li> : null}
                {!isLoading && !error && filteredTransactions.length === 0 ? (
                  <li className="rounded-2xl bg-white p-4 text-sm text-slate-500">{searchTerm.trim() ? "No matching transactions." : "No transactions added yet."}</li>
                ) : null}
                {filteredTransactions.map(({ id, title, date, amount, category, type }) => {
                        const isExpense = type === "expense"
                        return (
                  <li key={id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                            <div className="flex items-center gap-3">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${isExpense ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
                        {isExpense ? <LiaArrowUpSolid className="h-5 w-5" /> : <LiaArrowDownSolid className="h-5 w-5" />}
                                </span>
                                <div className="flex flex-col leading-tight">
                                      <span className="text-sm font-semibold text-slate-800">{title}</span>
                                      <span className="text-xs text-slate-400">{category} · {date}</span>
                                </div>
                            </div>
                    <span className={`text-sm font-semibold ${isExpense ? "text-red-500" : "text-green-600"}`}>
                      {isExpense ? "-" : "+"}{formatAmount(Math.abs(amount))}
                            </span>
                        </li>
                        )
                    })}
                </ul>
             </div>
    </div>
    </div>
  )
}
