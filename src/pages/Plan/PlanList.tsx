import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FiArrowLeft, FiMoreVertical, FiPlus } from "react-icons/fi"
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

type PlanItem = {
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
const palette = ["#f51d81", "#8200bb", "#3c10ac", "#4665e7", "#4ebee4"]
const budgetIconByCategory: Record<string, typeof TbCar> = {
    "Food & Dining": TbToolsKitchen2,
    "Transportation": TbCar,
    "Bills & Utilities": TbBolt,
    "Shopping": TbShoppingBag,
    "Other": TbWallet,
}
const budgetIconFor = (category: string) => budgetIconByCategory[category] || TbBeach

const toPlanItem = (plan: PlanRecord, index: number): PlanItem => ({
    id: plan._id,
    name: plan.name,
    amount: currency(plan.saved),
    target: currency(plan.target),
    progress: plan.target > 0 ? Math.min(100, Math.round((plan.saved / plan.target) * 100)) : 0,
    color: palette[index % palette.length],
    icon: budgetIconFor(plan.category),
    iconBackground: `${palette[index % palette.length]}1a`,
    raw: plan,
})

const PlanRow = ({ item, isMenuOpen, onToggleMenu, onEdit, onDelete }: { item: PlanItem; isMenuOpen: boolean; onToggleMenu: () => void; onEdit: () => void; onDelete: () => void }) => {
    const Icon = item.icon
    return (
        <article className="rounded-[20px] bg-white p-4 shadow-[0_5px_18px_rgba(27,38,58,0.04)]">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: item.iconBackground, color: item.color }}><Icon className="h-6 w-6" /></span>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold">{item.name}</h2>
                        <p className="mt-1 text-xs font-medium text-slate-950">{item.amount} <span className="font-normal text-slate-500">of {item.target}</span></p>
                    </div>
                </div>
                <div className="relative">
                    <button type="button" onClick={onToggleMenu} aria-label={`${item.name} options`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-50"><FiMoreVertical className="h-4 w-4" /></button>
                    {isMenuOpen ? <div className="absolute right-0 top-9 z-10 w-28 rounded-xl border border-slate-100 bg-white p-1 text-xs font-semibold shadow-lg"><button type="button" onClick={onEdit} className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50">Edit</button><button type="button" onClick={onDelete} className="w-full rounded-lg px-3 py-2 text-left text-red-500 hover:bg-red-50">Delete</button></div> : null}
                </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${item.progress}%`, backgroundColor: item.color }} /></div>
                <span className="text-xs font-bold" style={{ color: item.color }}>{item.progress}%</span>
            </div>
        </article>
    )
}

export const PlanList = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState<"goals" | "budgets">(searchParams.get("view") === "budgets" ? "budgets" : "goals")
    const [items, setItems] = useState<PlanItem[]>([])
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    const loadItems = async (tab: "goals" | "budgets") => {
        try {
            const userId = getUserId()
            if (!userId) {
                setItems([])
                return
            }

            const response = await fetch(`${API_BASE_URL}/api/plans?type=${tab === "goals" ? "Goal" : "Budget"}&userId=${encodeURIComponent(userId)}`)
            const data = await response.json()
            setItems((data.plans || []).map(toPlanItem))
        } catch {
            setItems([])
        }
    }

    useEffect(() => {
        loadItems(activeTab)
    }, [activeTab])

    const selectTab = (tab: "goals" | "budgets") => {
        setActiveTab(tab)
        setOpenMenuId(null)
        setSearchParams({ view: tab })
    }

    const deletePlan = async (id: string) => {
        if (!window.confirm("Delete this plan?")) return
        try {
            const userId = getUserId()
            if (!userId) return
            await fetch(`${API_BASE_URL}/api/plans/${id}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" })
            setItems((currentItems) => currentItems.filter((item) => item.id !== id))
        } finally {
            setOpenMenuId(null)
        }
    }

    return (
        <main className="min-h-screen bg-[#f8f9fb] px-4 pb-28 text-slate-950 sm:px-6">
            <div className="mx-auto w-full max-w-md">
                <header className="flex items-center justify-between py-6">
                    <button type="button" onClick={() => navigate("/plan")} aria-label="Back to my plan" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white"><FiArrowLeft className="h-5 w-5 text-primary" /></button>
                    <h1 className="text-lg font-bold tracking-tight">All Plans</h1>
                    <button type="button" onClick={() => navigate(`/add-plan?type=${activeTab === "goals" ? "Goal" : "Budget"}`)} aria-label={`Add ${activeTab === "goals" ? "goal" : "budget"}`} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-sm hover:bg-slate-800"><FiPlus className="h-5 w-5" /></button>
                </header>

                <div className="grid grid-cols-2 rounded-full bg-slate-200/80 p-1 shadow-inner" role="tablist" aria-label="Plan type">
                    {(["goals", "budgets"] as const).map((tab) => (
                        <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => selectTab(tab)} className={`rounded-full py-2.5 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-primary text-white shadow-sm" : "text-primary"}`}>{tab}</button>
                    ))}
                </div>

                <div className="mt-7 flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Your progress</p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight">{items.length} {activeTab}</h2>
                    </div>
                    <span className="text-xs font-medium text-slate-500">Updated today</span>
                </div>

                <div className="mt-4 space-y-3">
                    {items.length ? items.map((item) => (
                        <PlanRow
                            key={item.id}
                            item={item}
                            isMenuOpen={openMenuId === item.id}
                            onToggleMenu={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            onEdit={() => navigate("/add-plan", { state: { id: item.raw._id, name: item.raw.name, target: String(item.raw.target), saved: String(item.raw.saved), deadline: item.raw.targetDate, type: activeTab === "goals" ? "Goal" : "Budget", category: item.raw.category, period: item.raw.period, startDate: item.raw.startDate, endDate: item.raw.endDate, alertAt: String(item.raw.alertAt), description: item.raw.description, status: item.raw.status, monthlyContribution: String(item.raw.monthlyContribution), targetDate: item.raw.targetDate } })}
                            onDelete={() => deletePlan(item.id)}
                        />
                    )) : <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">No {activeTab} left.</p>}
                </div>
            </div>
        </main>
    )
}
