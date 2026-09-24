import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { HiOutlineHome } from "react-icons/hi";
import { HiOutlineChartBar } from "react-icons/hi2";
import { PiHandTapLight } from "react-icons/pi";
import { TbUserCircle } from "react-icons/tb";

const navItems = [
    { label: "Home", icon: HiOutlineHome, to: "/dashboard" },
    { label: "Report", icon: HiOutlineChartBar, to: "/report" },
    { label: "Plan", icon: PiHandTapLight, to: "/plan" },
];

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="fixed w-full bottom-3 flex items-center justify-between px-8 py-3 bg-white rounded-3xl shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
            {navItems.slice(0, 2).map(({ label, icon: Icon, to }) => (
                <NavLink
                    key={label}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 ${isActive ? "text-primary active" : "text-gray-600"}`
                    }
                >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{label}</span>
                </NavLink>
            ))}

            <NavLink
                to="/add-transaction"
                className="absolute left-[52%] -top-6 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg"
                aria-label="Add"
            >
                <FiPlus className="w-7 h-7" />
            </NavLink>

            <NavLink
                to={navItems[2].to}
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 ${isActive ? "text-primary active" : "text-gray-600"}`
                }
            >
                <PiHandTapLight className="w-6 h-6" />
                <span className="text-xs font-medium">Plan</span>
            </NavLink>

            <div className="relative">
                <button type="button" onClick={() => navigate("/user")} aria-label="Open user profile" className="flex flex-col items-center gap-1 text-gray-600">
                    <TbUserCircle className="h-6 w-6" />
                    <span className="text-xs font-medium">User</span>
                </button>
            </div>
        </footer>
    );
};