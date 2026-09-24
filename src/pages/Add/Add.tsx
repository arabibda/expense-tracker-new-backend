import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { LiaArrowLeftSolid } from "react-icons/lia";
import { MdPayments, MdSavings } from "react-icons/md";
import { getUserId } from '../../utils/auth'
import { API_BASE_URL } from '../../utils/api'

type StoredTransaction = {
    _id: string;
    title: string;
    amount: number;
    date: string;
    category: string;
    type: "income" | "expense";
    createdAt: string;
};

const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);

export const AddTransaction = () =>{
    const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadRecentTransactions = async () => {
            try {
                const userId = getUserId();
                if (!userId) {
                    throw new Error("Your session has expired. Please sign in again.");
                }

                const query = `?userId=${encodeURIComponent(userId)}`;
                const [incomeResponse, expenseResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/auth/incomes${query}`),
                    fetch(`${API_BASE_URL}/api/auth/expenses${query}`),
                ]);
                const [incomeData, expenseData] = await Promise.all([
                    incomeResponse.json(),
                    expenseResponse.json(),
                ]);

                if (!incomeResponse.ok || !expenseResponse.ok) {
                    throw new Error(incomeData.message || expenseData.message || "Unable to load transactions.");
                }

                const recentTransactions = [
                    ...incomeData.incomes.map((income: Omit<StoredTransaction, "title" | "type"> & { incomeTitle: string }) => ({
                        ...income,
                        title: income.incomeTitle,
                        type: "income" as const,
                    })),
                    ...expenseData.expenses.map((expense: Omit<StoredTransaction, "title" | "type"> & { expenseTitle: string }) => ({
                        ...expense,
                        title: expense.expenseTitle,
                        type: "expense" as const,
                    })),
                ]
                    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
                    .slice(0, 10);

                setTransactions(recentTransactions);
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Unable to load transactions.");
            } finally {
                setIsLoading(false);
            }
        };

        loadRecentTransactions();
    }, []);

    return(
        <>
        <div className="bg-white h-screen  px-5">
            <div className="relative flex w-full items-center py-5">
                <NavLink to="/dashboard" className="flex items-center text-secondary text-3xl" aria-label="Back"><LiaArrowLeftSolid /> </NavLink>
                <h2 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-gray-600">Add</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <NavLink to="/add-income" className="text-center rounded-2xl bg-violet-100 p-4 transition hover:shadow-md">
                      <MdSavings className="mx-auto mb-2 text-3xl text-violet-500" />
                      <h3 className="text-md font-medium text-gray-700">Add Income</h3>
                 </NavLink>
                 <NavLink to="/add-expense" className="text-center rounded-2xl bg-rose-100 p-4 transition hover:shadow-md">
                      <MdPayments className="mx-auto mb-2 text-3xl text-rose-500" />
                      <h3 className="text-md font-medium text-gray-700">Add Expense</h3>
                 </NavLink>
            </div>
             <h3 className="text-lg font-semibold text-gray-600 my-4">Last Added</h3>
             <div className="h-[calc(100vh-300px)] overflow-y-auto">
             <ul className="space-y-3">
                {isLoading ? <li className="rounded-xl bg-gray-50 p-3 text-sm text-gray-400">Loading transactions...</li> : null}
                {error ? <li className="rounded-xl bg-gray-50 p-3 text-sm text-red-500">{error}</li> : null}
                {!isLoading && !error && transactions.length === 0 ? (
                    <li className="rounded-xl bg-gray-50 p-3 text-sm text-gray-400">No transactions added yet.</li>
                ) : null}
                {transactions.map(({ _id, title, date, amount, type, category }) => {
                    const isIncome = type === "income";

                    return (
                        <li key={`${type}-${_id}`} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                            <div className="flex items-center gap-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${isIncome ? "bg-violet-100 text-violet-500" : "bg-rose-100 text-rose-500"}`}>
                                    {isIncome ? <MdSavings className="text-xl" /> : <MdPayments className="text-xl" />}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-700">{title}</p>
                                    <p className="text-sm text-gray-400">{category} · {date}</p>
                                </div>
                            </div>
                            <span className={`font-semibold ${isIncome ? "text-violet-500" : "text-rose-500"}`}>
                                {isIncome ? "+" : "-"}{formatAmount(Math.abs(Number(amount)))}
                            </span>
                        </li>
                    );
                })}
             </ul>
            </div>
         </div>
        </>
    )
}