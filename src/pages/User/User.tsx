import { useNavigate } from "react-router-dom"
import { FiArrowLeft, FiChevronRight, FiEdit3 } from "react-icons/fi"
import { TbLock, TbLogout, TbUser } from "react-icons/tb"
import { clearAuthenticated } from "../../utils/auth"

type ProfileAction = {
    label: string
    icon: typeof TbUser
    color: string
    background: string
}

const profileActions: ProfileAction[] = [
    { label: "Account Info", icon: TbUser, color: "#ffffff", background: "#6c4df6" },
     { label: "Privacy Policy", icon: TbLock, color: "#ffffff", background: "#3f6d86" },
]

export const User = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        clearAuthenticated()
        navigate("/", { replace: true })
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-10 text-[#36384b] sm:px-6">

            <div className="mx-auto w-full max-w-md">
                <header className="flex items-center justify-between py-4">
                    <button type="button" onClick={() => navigate("/dashboard")} aria-label="Go back" className="grid h-9 w-9 place-items-center rounded-xl text-slate-900 hover:bg-slate-50"><FiArrowLeft className="h-5 w-5" /></button>
                    <h1 className="text-lg font-bold">Profile</h1>
                    <button type="button" aria-label="Edit profile" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100"><FiEdit3 className="h-4 w-4" /></button>
                </header>

                <section className="flex flex-col items-center pb-7 pt-2 text-center">
                    <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-[#a69cf4] via-[#8c83dc] to-[#6871ba] shadow-inner">
                        <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-b from-[#b8d5f2] to-[#5368a9] text-white"><TbUser className="h-16 w-16 stroke-[1.2]" /></div>
                    </div>
                    <h2 className="mt-3 text-base font-bold">Leslie Alexander</h2>
                    <p className="mt-1 text-xs text-slate-400">leslie@gmail.com</p>
                </section>

                <section className="space-y-3" aria-label="Profile options">
                    {profileActions.map(({ label, icon: Icon, color, background }) => (
                        <button key={label} type="button" className="flex w-full items-center gap-3 rounded-xl py-2 text-left transition hover:bg-slate-50">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ color, backgroundColor: background }}><Icon className="h-5 w-5" /></span>
                            <span className="flex-1 text-sm font-medium">{label}</span>
                            <FiChevronRight className="h-5 w-5 text-slate-400" />
                        </button>
                    ))}
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl py-2 text-left transition hover:bg-red-50">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-red-500 text-white"><TbLogout className="h-5 w-5" /></span>
                        <span className="flex-1 text-sm font-medium">Logout</span>
                        <FiChevronRight className="h-5 w-5 text-slate-400" />
                    </button>
                </section>
            </div>
        </main>
    )
}