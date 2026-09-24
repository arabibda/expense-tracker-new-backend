import { useNavigate } from 'react-router-dom'
import { TbUserCircle, TbLogout } from 'react-icons/tb'
import { clearAuthenticated } from '../../utils/auth'
export const Header =() =>{
     const navigate = useNavigate()
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleLogout = () => {
    clearAuthenticated()
    navigate('/', { replace: true })
  }

    return(
        <>
                   <div className="flex justify-between items-center profile-div p-4">
                       <div className="flex items-center gap-2.5 text-white">
                           <TbUserCircle className="h-9 w-9" />
                           <div className="flex flex-col leading-tight">
                               <span className="text-xs font-medium text-white/80">Welcome back</span>
                               <span className="text-sm font-semibold">{today}</span>
                           </div>
                       </div>
                       <button
                           type="button"
                           onClick={handleLogout}
                           className="flex items-center gap-1.5 cursor-pointer rounded-full bg-white/15 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25"
                       >
                           <TbLogout className="h-5 w-5" />
                           Logout
                       </button>
                   </div>
        </>
    )
}