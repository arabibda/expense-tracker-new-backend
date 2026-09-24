import { Formik, Form, Field, ErrorMessage } from "formik"
import { useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import { TbInfoTriangle } from "react-icons/tb"
import { getUserId } from "../../utils/auth"
import { API_BASE_URL } from "../../utils/api"

type PlanFormValues = {
    id?: string
    name: string
    target: string
    saved: string
    deadline: string
    type: string
    category: string
    period: string
    startDate: string
    endDate: string
    alertAt: string
    description: string
    status: string
    monthlyContribution: string
    targetDate: string
}

const renderError = (message: string) => (
    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
        <TbInfoTriangle className="h-4 w-4" />
        {message}
    </p>
)

export const AddPlan = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [submitError, setSubmitError] = useState("")
    const editingPlan = location.state as PlanFormValues | null
    const initialType = editingPlan?.type === "Budget" || searchParams.get("type") === "Budget" ? "Budget" : "Goal"
    const [activeType, setActiveType] = useState<"Goal" | "Budget">(initialType)
    const initialValues: PlanFormValues = editingPlan?.id
        ? editingPlan
        : { name: "", target: "", saved: "0", deadline: "", type: initialType, category: "", period: "Monthly", startDate: "", endDate: "", alertAt: "80", description: "", status: "Active", monthlyContribution: "", targetDate: "" }

    return (
        <main className="min-h-screen bg-[#f8f9fb] px-5 pb-10 text-slate-950 sm:px-6">
            <div className="mx-auto w-full max-w-md">
                <header className="relative flex items-center justify-center py-6">
                    <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="absolute left-0 grid h-9 w-9 place-items-center rounded-full transition hover:bg-white">
                        <FiArrowLeft className="h-5 w-5 text-secondary" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">{editingPlan?.id ? (activeType === "Budget" ? "Edit Budget" : "Edit Goal") : (activeType === "Budget" ? "Add New Budget" : "Add New Goal")}</h1>
                </header>

                <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_24px_rgba(27,38,58,0.06)]">
                    <div className="mb-5 grid grid-cols-2 rounded-full bg-slate-200/80 p-1 shadow-inner" role="tablist" aria-label="Plan type">
                        {(["Goal", "Budget"] as const).map((type) => (
                            <button key={type} type="button" role="tab" aria-selected={activeType === type} onClick={() => setActiveType(type)} className={`cursor-pointer rounded-full py-2.5 text-sm font-semibold transition ${activeType === type ? "bg-primary text-white shadow-sm" : "text-primary"}`}>{type}</button>
                        ))}
                    </div>
                    <p className="text-sm leading-6 text-slate-500">{activeType === "Budget" ? "Set a spending limit and keep your expenses under control." : "Set a target and track your progress toward something important."}</p>
                    <Formik<PlanFormValues>
                        initialValues={initialValues}
                        validate={(values) => {
                            const errors: Partial<Record<keyof PlanFormValues, string>> = {}
                            if (!values.name.trim()) errors.name = "Enter a plan name"
                            if (!values.target || Number(values.target) <= 0) errors.target = "Enter a target greater than zero"
                            if (Number(values.saved) < 0) errors.saved = "Saved amount cannot be negative"
                            if (values.saved && Number(values.saved) > Number(values.target)) errors.saved = "Saved amount cannot exceed the target"
                            if (values.type === "Goal" && !values.targetDate) errors.targetDate = "Choose a target date"
                            return errors
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            setSubmitError("")
                            const userId = getUserId()
                            if (!userId) {
                                setSubmitError("Your session has expired. Please sign in again.")
                                setSubmitting(false)
                                return
                            }

                            const payload = { ...values, type: activeType, userId }
                            try {
                                const response = await fetch(
                                    values.id ? `${API_BASE_URL}/api/plans/${values.id}` : `${API_BASE_URL}/api/plans`,
                                    {
                                        method: values.id ? "PUT" : "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload),
                                    }
                                )
                                const data = await response.json()
                                if (!response.ok) {
                                    setSubmitError(data.message || "Saving plan failed.")
                                    return
                                }
                                navigate("/plan")
                            } catch {
                                setSubmitError("Unable to reach the server. Please try again.")
                            } finally {
                                setSubmitting(false)
                            }
                        }}
                    >
                        {({ errors, touched, isSubmitting, setFieldValue }) => (
                            <Form className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-800">{activeType === "Budget" ? "Budget name" : "Goal name"}<sup className="text-red-600">*</sup></label>
                                    <Field id="name" name="name" type="text" placeholder={activeType === "Budget" ? "Monthly Food Budget" : "e.g. New Laptop"} className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.name && touched.name ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"}`} />
                                    <ErrorMessage name="name" render={renderError} />
                                </div>

                                {activeType === "Budget" ? <>
                                    <div>
                                        <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-slate-800">Category<sup className="text-red-600">*</sup></label>
                                        <Field as="select" id="category" name="category" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"><option value="">Select a category</option><option value="Food & Dining">Food</option><option value="Transportation">Transportation</option><option value="Bills & Utilities">Bills & Utilities</option><option value="Shopping">Shopping</option><option value="Other">Other</option></Field>
                                    </div>
                                    <div>
                                    <label htmlFor="target" className="mb-1.5 block text-sm font-semibold text-slate-800">Budget amount<sup className="text-red-600">*</sup></label>
                                    <Field id="target" name="target" type="number" min="0.01" step="0.01" placeholder="6000" className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.target && touched.target ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"}`} />
                                    <ErrorMessage name="target" render={renderError} />
                                    </div>
                                </> : <>
                                    <div>
                                        <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-slate-800">Goal category<sup className="text-red-600">*</sup></label>
                                        <Field as="select" id="category" name="category" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"><option value="">Select a category</option><option value="Personal">Personal</option><option value="Home">Home</option><option value="Travel">Travel</option><option value="Education">Education</option><option value="Other">Other</option></Field>
                                    </div>
                                    <div>
                                        <label htmlFor="target" className="mb-1.5 block text-sm font-semibold text-slate-800">Target amount<sup className="text-red-600">*</sup></label>
                                        <Field id="target" name="target" type="number" min="0.01" step="0.01" placeholder="80000" className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.target && touched.target ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"}`} />
                                        <ErrorMessage name="target" render={renderError} />
                                    </div>
                                    <div>
                                        <label htmlFor="saved" className="mb-1.5 block text-sm font-semibold text-slate-800">Current saved amount<sup className="text-red-600">*</sup></label>
                                        <Field id="saved" name="saved" type="number" min="0" step="0.01" placeholder="25000" className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${errors.saved && touched.saved ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-slate-500 focus:ring-slate-100"}`} />
                                        <ErrorMessage name="saved" render={renderError} />
                                    </div>
                                    <div><label htmlFor="startDate" className="mb-1.5 block text-sm font-semibold text-slate-800">Start date<sup className="text-red-600">*</sup></label><Field id="startDate" name="startDate" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" /></div>
                                    <div><label htmlFor="targetDate" className="mb-1.5 block text-sm font-semibold text-slate-800">Target date <sup className="text-red-600">*</sup></label><Field id="targetDate" name="targetDate" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" /></div>
                                    <div><label htmlFor="monthlyContribution" className="mb-1.5 block text-sm font-semibold text-slate-800">Monthly contribution</label><Field id="monthlyContribution" name="monthlyContribution" type="number" min="0" step="0.01" placeholder="15000" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" /></div>
                                    

                                    <div><label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-slate-800">Status <sup className="text-red-600">*</sup></label><Field as="select" id="status" name="status" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"><option value="Active">Active</option><option value="Paused">Paused</option><option value="Completed">Completed</option></Field></div>
                                    <div><label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-800">Description</label><Field as="textarea" id="description" name="description" rows="3" placeholder="Save money for new laptop" className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" /></div>
                                </>}

                                {activeType === "Budget" ? <>
                                <div>
                                    <label htmlFor="period" className="mb-1.5 block text-sm font-semibold text-slate-800">Budget period<sup className="text-red-600">*</sup></label>
                                    <Field as="select" id="period" name="period" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100">
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="startDate" className="mb-1.5 block text-sm font-semibold text-slate-800">Start date<sup className="text-red-600">*</sup></label>
                                        <Field id="startDate" name="startDate" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="mb-1.5 block text-sm font-semibold text-slate-800">End date<sup className="text-red-600">*</sup></label>
                                        <Field id="endDate" name="endDate" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="alertAt" className="mb-1.5 block text-sm font-semibold text-slate-800">Alert when spending reaches (%)</label>
                                    <Field id="alertAt" name="alertAt" type="number" min="1" max="100" placeholder="80" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" />
                                </div>
                                <div>
                                    <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-800">Description</label>
                                    <Field as="textarea" id="description" name="description" rows="3" placeholder="Food spending limit" className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100" />
                                </div>
                                <div>
                                    <label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-slate-800">Status <sup className="text-red-600">*</sup></label>
                                    <Field as="select" id="status" name="status" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"><option value="Active">Active</option><option value="Paused">Paused</option><option value="Completed">Completed</option></Field>
                                </div>
                                </> : null}

                                {submitError ? renderError(submitError) : null}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => navigate(-1)} className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600">Cancel</button>
                                    <button type="submit" onClick={() => setFieldValue("type", activeType)} disabled={isSubmitting} className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">{activeType === "Budget" ? "Save Budget" : (editingPlan?.id ? "Save Changes" : "Save Goal")}</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </section>
            </div>
        </main>
    )
}
