import { Route, Routes } from 'react-router-dom'
import { Login } from '../pages/Auth/Login'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { Register } from '../pages/Auth/Register'
import { RequireAuth } from './RequireAuth'
import { RedirectIfAuth } from './RedirectIfAuth'
import {AddTransaction} from '../pages/Add/Add'
import { AddIncome } from '../pages/Add/Income'
import { AddExpense } from '../pages/Add/Expense'
import { Report } from '../pages/Report/Report'
import { Plan } from '../pages/Plan/Plan.tsx'
import { AddPlan } from  '../pages/Plan/AddPlan'
import { PlanList } from '../pages/Plan/PlanList'
import { User } from '../pages/User/User'



export const AppRoutes = () => {
   return (
      <Routes>
         <Route path="/" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
         <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
         <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
         <Route path="/add-transaction" element={<RequireAuth><AddTransaction /></RequireAuth>} />
         <Route path="/add-income" element={<RequireAuth><AddIncome /></RequireAuth>} />
         <Route path="/add-expense" element={<RequireAuth><AddExpense /></RequireAuth>} />
         <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
         <Route path="/plan" element={<RequireAuth><Plan /></RequireAuth>} />
         <Route path="/add-plan" element={<RequireAuth><AddPlan /></RequireAuth>} />
         <Route path="/plan/all" element={<RequireAuth><PlanList /></RequireAuth>} />
         <Route path="/user" element={<RequireAuth><User /></RequireAuth>} />
      </Routes>
   )
}