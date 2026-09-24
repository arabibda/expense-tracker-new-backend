import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiChevronDown, FiPieChart, FiTrendingDown, FiTrendingUp } from "react-icons/fi"
import { getUserId } from '../../utils/auth'
import { API_BASE_URL } from '../../utils/api'

type Transaction = {
    _id: string
    expenseTitle?: string
    incomeTitle?: string
    amount: number
    date: string
    category?: string
}

type ReportItem = {
    name: string
    amount: number
    percentage: number
    color: string
}

const reportColors = ["#4ea7f4", "#ff7900", "#34c477", "#8d5cec", "#ef5c8e", "#e5a62d"]

const currentMonth = new Date().toISOString().slice(0, 7)

const formatMonth = (month: string) => {
    const [year, monthNumber] = month.split("-").map(Number)
    return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1))
}

const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount)

const normalizeDate = (date: string) => {
    const [day, month, year] = date.split("/")
    return year && month && day ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : date
}

const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${normalizeDate(date)}T00:00:00`))

const createReportItems = (transactions: Transaction[]): ReportItem[] => {
    const totals = transactions.reduce<Record<string, number>>((categories, transaction) => {
        const name = transaction.category?.trim() || "Other"
        categories[name] = (categories[name] || 0) + Number(transaction.amount)
        return categories
    }, {})
    const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0)

    return Object.entries(totals)
        .sort(([, firstAmount], [, secondAmount]) => secondAmount - firstAmount)
        .map(([name, amount], index) => ({
            name,
            amount,
            percentage: total ? (amount / total) * 100 : 0,
            color: reportColors[index % reportColors.length],
        }))
}

export const Report = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<"expenses" | "income">("expenses")
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [expenses, setExpenses] = useState<Transaction[]>([])
    const [incomes, setIncomes] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadReport = async () => {
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
                const [incomeData, expenseData] = await Promise.all([incomeResponse.json(), expenseResponse.json()])

                if (!incomeResponse.ok || !expenseResponse.ok) {
                    throw new Error(incomeData.message || expenseData.message || "Unable to load report.")
                }

                setIncomes(incomeData.incomes || [])
                setExpenses(expenseData.expenses || [])
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Unable to load report.")
            } finally {
                setIsLoading(false)
            }
        }

        loadReport()
    }, [])

    const selectedTransactions = (activeTab === "expenses" ? expenses : incomes)
        .filter((transaction) => normalizeDate(transaction.date).startsWith(selectedMonth))
        .sort((firstTransaction, secondTransaction) => normalizeDate(secondTransaction.date).localeCompare(normalizeDate(firstTransaction.date)))
    const currentItems = createReportItems(selectedTransactions)
    const total = currentItems.reduce((sum, item) => sum + item.amount, 0)
    const chartSegments = currentItems.length
        ? `conic-gradient(${currentItems.map((item, index) => {
            const previous = currentItems.slice(0, index).reduce((sum, segment) => sum + segment.percentage, 0)
            return `${item.color} ${previous}% ${previous + item.percentage}%`
        }).join(", ")})`
        : "conic-gradient(#e7edf5 0 100%)"
    const reportLabel = activeTab === "expenses" ? "Expenses" : "Income"

    return (
        <main className="min-h-screen bg-[#f7f9fc] px-4 pb-10 text-slate-900">
            <header className="mx-auto flex w-full items-center justify-between py-5">
                <div className="flex items-center gap-3">
                 
                    <h1 className="text-lg font-bold">Report</h1>
                </div>
                <label className="relative flex items-center rounded-full bg-white text-xs font-semibold shadow-sm">
                    <span className="sr-only">Select report month</span>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className="appearance-none bg-transparent py-2 pl-3 pr-8 outline-none"
                        aria-label={`Selected month ${formatMonth(selectedMonth)}`}
                    />
                    <FiChevronDown className="pointer-events-none absolute right-3 h-4 w-4" aria-hidden="true" />
                </label>
            </header>

            <section className="mx-auto w-full" aria-label="Report type">
                <div className="grid grid-cols-2 rounded-full bg-slate-200/80 p-1 shadow-inner">
                    {(["expenses", "income"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full py-2.5 text-sm font-medium transition ${activeTab === tab ? "bg-primary text-white shadow-sm" : "text-slate-500"}`}
                        >
                            {tab === "expenses" ? "Expenses" : "Income"}
                        </button>
                    ))}
                </div>

                <div className="mt-7 flex items-center justify-between">
                    <h2 className="text-base font-bold">{reportLabel} Report</h2>
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${activeTab === "expenses" ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"}`}>
                        <FiPieChart className="h-5 w-5" />
                    </span>
                </div>

                <div className="relative mx-auto mt-5 grid h-64 w-64 place-items-center">
                    <div className="h-56 w-56 rounded-full" style={{ background: chartSegments, mask: "radial-gradient(transparent 0 55%, #000 56%)", WebkitMask: "radial-gradient(transparent 0 55%, #000 56%)" }} />
                    <div className="absolute inset-0 grid place-items-center text-center">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total {reportLabel}</p>
                            <p className="mt-1 text-2xl font-bold tracking-tight">{formatAmount(total)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                    <h2 className="font-medium text-slate-500">All {reportLabel}</h2>
                    <p className="font-semibold">Total <span className="font-bold">{formatAmount(total)}</span></p>
                </div>

                <div className="mt-4 space-y-3 pb-16">
                    {isLoading ? <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">Loading report...</p> : null}
                    {error ? <p className="rounded-2xl bg-white p-4 text-sm text-red-600 shadow-sm">{error}</p> : null}
                    {!isLoading && !error && selectedTransactions.length === 0 ? <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">No {reportLabel.toLowerCase()} recorded in {formatMonth(selectedMonth)}.</p> : null}
                    {selectedTransactions.map((transaction) => (
                        <article key={transaction._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${activeTab === "expenses" ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"}`}>
                                        {activeTab === "expenses" ? <FiTrendingDown className="h-5 w-5" /> : <FiTrendingUp className="h-5 w-5" />}
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-bold">{activeTab === "expenses" ? transaction.expenseTitle : transaction.incomeTitle}</h3>
                                        <p className="mt-0.5 text-xs text-slate-500">{transaction.category || "Other"} · {formatDate(transaction.date)}</p>
                                    </div>
                                </div>
                                <p className="shrink-0 text-sm font-bold">{formatAmount(transaction.amount)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <button type="button" onClick={() => navigate("/add-transaction")} aria-label="Add transaction" className="fixed bottom-6 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-violet-600 text-3xl font-light text-white shadow-lg shadow-violet-300 transition hover:bg-violet-700">
                +
            </button>
        </main>
    )
}