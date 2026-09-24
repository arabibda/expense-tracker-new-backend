import { useEffect, useRef, useState, type TouchEvent } from "react"
import { useNavigate } from "react-router-dom"
import { FiArrowLeft, FiChevronDown, FiMoreVertical, FiPlus } from "react-icons/fi"
import { TbBeach, TbBolt, TbCar, TbShoppingBag, TbToolsKitchen2, TbWallet } from "react-icons/tb"
import { getUserId } from "../../utils/auth"
import { API_BASE_URL } from "../../utils/api"

type PlanRecord = {
    _id: string
    name: string
    target: number
    saved: number
    category: string
    period: string
    startDate: string
    endDate: string
    targetDate: string
    alertAt: number
    monthlyContribution: number
    description: string
    status: string
}

type Goal = {
    id: string
    name: string
    saved: string
    target: string
    progress: number
    remaining: string
    color: string
    status: string
    raw: PlanRecord
}

type Budget = {
    id: string
    name: string
    amount: string
    target: string
    progress: number
    color: string
    icon: typeof TbCar
    iconBackground: string
    raw: PlanRecord
}

const currency = (value: number) => `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const palette = ["#f44e9b", "#8200bb", "#3c10ac", "#4665e7", "#4ebee4"]
const currentMonth = new Date().toISOString().slice(0, 7)
const budgetIconByCategory: Record<string, typeof TbCar> = {
    "Food & Dining": TbToolsKitchen2,
    "Transportation": TbCar,
    "Bills & Utilities": TbBolt,
    "Shopping": TbShoppingBag,
    "Other": TbWallet,
}
const budgetIconFor = (category: string) => budgetIconByCategory[category] || TbBeach

const formatMonth = (month: string) => {
    const [year, monthNumber] = month.split("-").map(Number)
    return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1))
}

const isPlanInMonth = (plan: PlanRecord, month: string) => {
    const [year, monthNumber] = month.split("-").map(Number)
    const monthStart = `${month}-01`
    const monthEnd = `${month}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}`
    const startDate = plan.startDate || plan.targetDate
    const endDate = plan.endDate || plan.targetDate

    return (!startDate || startDate <= monthEnd) && (!endDate || endDate >= monthStart)
}

const goalStatus = (progress: number) => {
    if (progress >= 100) return "You've reached this goal."
    if (progress >= 50) return "You're on track with this goal."
    return "Keep building toward this goal."
}

export const Plan = () => {
    const navigate = useNavigate()
    const [goals, setGoals] = useState<Goal[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [activeGoalIndex, setActiveGoalIndex] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const touchStartX = useRef<number | null>(null)
    const activeGoal = goals[activeGoalIndex]

    const loadPlans = async () => {
        try {
            const userId = getUserId()
            if (!userId) {
                setGoals([])
                setBudgets([])
                return
            }

            const query = `userId=${encodeURIComponent(userId)}`
            const [goalsResponse, budgetsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/plans?type=Goal&${query}`),
                fetch(`${API_BASE_URL}/api/plans?type=Budget&${query}`),
            ])
            const goalsData = await goalsResponse.json()
            const budgetsData = await budgetsResponse.json()

            setGoals((goalsData.plans || []).filter((plan: PlanRecord) => isPlanInMonth(plan, selectedMonth)).map((plan: PlanRecord, index: number) => {
                const progress = plan.target > 0 ? Math.min(100, Math.round((plan.saved / plan.target) * 100)) : 0
                return {
                    id: plan._id,
                    name: plan.name,
                    saved: currency(plan.saved),
                    target: currency(plan.target),
                    progress,
                    remaining: `${currency(Math.max(0, plan.target - plan.saved))} Left`,
                    color: palette[index % palette.length],
                    status: goalStatus(progress),
                    raw: plan,
                }
            }))

            setBudgets((budgetsData.plans || []).filter((plan: PlanRecord) => isPlanInMonth(plan, selectedMonth)).map((plan: PlanRecord, index: number) => {
                const progress = plan.target > 0 ? Math.min(100, Math.round((plan.saved / plan.target) * 100)) : 0
                return {
                    id: plan._id,
                    name: plan.name,
                    amount: currency(plan.saved),
                    target: currency(plan.target),
                    progress,
                    color: palette[index % palette.length],
                    icon: budgetIconFor(plan.category),
                    iconBackground: `${palette[index % palette.length]}1a`,
                    raw: plan,
                }
            }))
        } catch {
            setGoals([])
            setBudgets([])
        }
    }

    useEffect(() => {
        loadPlans()
    }, [selectedMonth])

    const showGoal = (direction: "previous" | "next") => {
        setIsMenuOpen(false)
        setActiveGoalIndex((index) => direction === "next" ? (index + 1) % goals.length : (index - 1 + goals.length) % goals.length)
    }

    const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
    }

    const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return
        const distance = event.changedTouches[0].clientX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(distance) < 45) return
        showGoal(distance < 0 ? "next" : "previous")
    }

    const editGoal = () => {
        if (!activeGoal) return
        navigate("/add-plan", { state: { id: activeGoal.raw._id, name: activeGoal.raw.name, target: String(activeGoal.raw.target), saved: String(activeGoal.raw.saved), deadline: activeGoal.raw.targetDate, type: "Goal", category: activeGoal.raw.category, period: activeGoal.raw.period, startDate: activeGoal.raw.startDate, endDate: activeGoal.raw.endDate, alertAt: String(activeGoal.raw.alertAt), description: activeGoal.raw.description, status: activeGoal.raw.status, monthlyContribution: String(activeGoal.raw.monthlyContribution), targetDate: activeGoal.raw.targetDate } })
    }

    const deleteGoal = async () => {
        if (!activeGoal || !window.confirm("Delete this goal?")) return
        try {
            const userId = getUserId()
            if (!userId) return
            await fetch(`${API_BASE_URL}/api/plans/${activeGoal.id}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" })
            setActiveGoalIndex(0)
            await loadPlans()
        } finally {
            setIsMenuOpen(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#f8f9fb] px-4 pb-28 text-slate-950 sm:px-6">
            <div className="mx-auto w-full max-w-md">
                <header className="flex items-center justify-between py-6">
                    <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white"><FiArrowLeft className="h-5 w-5 text-secondary" /></button>
                    <h1 className="text-lg font-bold tracking-tight">My Plan</h1>
                    <button type="button" onClick={() => navigate("/add-plan?type=Goal")} aria-label="Add a goal" className="grid h-9 w-9 bg-primary place-items-center rounded-full bg-p text-white shadow-sm hover:bg-slate-800"><FiPlus className="h-5 w-5" /></button>
                </header>

                <div className="mb-5 flex justify-end">
                    <label className="relative flex items-center rounded-full bg-white text-xs font-semibold shadow-sm">
                        <span className="sr-only">Select plan month</span>
                        <input type="month" value={selectedMonth} onChange={(event) => { setActiveGoalIndex(0); setSelectedMonth(event.target.value) }} className="appearance-none bg-transparent py-2 pl-3 pr-8 outline-none" aria-label={`Selected month ${formatMonth(selectedMonth)}`} />
                        <FiChevronDown className="pointer-events-none absolute right-3 h-4 w-4" aria-hidden="true" />
                    </label>
                </div>

                <section aria-labelledby="goals-heading">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 id="goals-heading" className="text-base font-bold">Goals</h2>
                        <button type="button" onClick={() => navigate("/plan/all?view=goals")} className="text-sm font-medium text-slate-700 hover:text-slate-950">View All</button>
                    </div>
                    {goals.length ? <>
                    <div className="relative overflow-hidden rounded-[22px]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: "pan-y" }}>
                        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeGoalIndex * 100}%)` }}>
                            {goals.map((goal) => (
                                <article key={goal.id} className="w-full shrink-0 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_24px_rgba(27,38,58,0.06)]">
                                    <div className="p-5 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${goal.color}1a`, color: goal.color }}><span className="grid h-5 w-5 place-items-center rounded-full border-2 border-current text-[10px] font-black">₹</span></span>
                                                <div><h3 className="text-sm font-bold">{goal.name}</h3></div>
                                            </div>
                                            <div className="relative">
                                                <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Goal options" className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100"><FiMoreVertical className="h-4 w-4" /></button>
                                                {isMenuOpen && goal.id === activeGoal.id ? <div className="absolute right-0 top-9 z-10 w-28 rounded-xl border border-slate-100 bg-white p-1 text-xs font-semibold shadow-lg"><button type="button" onClick={editGoal} className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50">Edit goal</button><button type="button" onClick={deleteGoal} className="w-full rounded-lg px-3 py-2 text-left text-red-500 hover:bg-red-50">Delete</button></div> : null}
                                            </div>
                                        </div>
                                        <div className="mt-7 flex items-baseline gap-1"><span className="text-xl font-bold">{goal.saved}</span><span className="text-xs text-slate-500">Out of {goal.target}</span></div>
                                        <div className="mt-5"><div className="relative h-2.5 rounded-full bg-[#ffebe6]"><div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }} /><span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${goal.progress}%`, backgroundColor: goal.color }} /></div><div className="mt-2 flex items-center justify-between text-[11px] text-slate-500"><span>Your Progress</span><strong className="text-slate-950">{goal.remaining}</strong></div></div>
                                    </div>
                                    <div className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white" style={{ backgroundColor: goal.color }}><span className="grid h-4 w-4 place-items-center rounded-full border border-white text-[10px] font-bold">i</span>{goal.status}</div>
                                </article>
                            ))}
                        </div>
                    </div>
                    <div className="mt-3 flex justify-center gap-1.5" aria-label="Goal slides">{goals.map((goal, index) => <button key={goal.id} type="button" onClick={() => setActiveGoalIndex(index)} aria-label={`Show ${goal.name}`} className={`h-1.5 rounded-full transition-all ${activeGoalIndex === index ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300"}`} />)}</div>
                    </> : <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">No goals yet. Add one to get started.</p>}
                </section>

                <section aria-labelledby="budgets-heading" className="mt-5">
                    <div className="mb-4 flex items-center justify-between"><h2 id="budgets-heading" className="text-base font-bold">Budgets</h2><button type="button" onClick={() => navigate("/plan/all?view=budgets")} className="text-xs font-medium text-slate-500 hover:text-slate-950">View All</button></div>
                    <div className="space-y-3">{budgets.length ? budgets.map(({ id, name, amount, target, progress, color, icon: Icon, iconBackground }) => <article key={id} className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3.5 shadow-[0_5px_18px_rgba(27,38,58,0.035)]"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: iconBackground, color }}><Icon className="h-6 w-6" /></span><div className="min-w-0"><h3 className="truncate text-sm font-bold">{name}</h3><p className="mt-1 text-xs font-medium text-slate-950">{amount} <span className="font-normal text-slate-500">of {target}</span></p></div></div><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${progress}%, ${color}22 0)` }}><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-bold" style={{ color }}>{progress}%</span></div></article>) : <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">No budgets yet. Add one to get started.</p>}</div>
                </section>
            </div>
        </main>
    )
}
