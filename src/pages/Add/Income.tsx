import { NavLink } from "react-router-dom";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiaArrowLeftSolid } from "react-icons/lia";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TbInfoTriangle } from "react-icons/tb";;
import { getUserId } from '../../utils/auth'
import { API_BASE_URL } from '../../utils/api'
const renderError = (message:string) =>{
  return (
    <div className="flex items-center gap-1 text-md text-red-600">
      <TbInfoTriangle className="text-red-600" />
       <span>{message}</span>
    </div>
  )
}

const formatDateForStorage = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export const AddIncome = () =>{
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    return(
        <>
          <div className="bg-white h-screen  px-5">
            <div className="relative flex w-full items-center py-5">
                <NavLink to="/add-transaction" className="flex items-center text-secondary text-3xl" aria-label="Back"><LiaArrowLeftSolid /> </NavLink>
                <h2 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-gray-600">Add Income</h2>
            </div>
             <Formik
  initialValues={{ incomeTitle: "", amount: "", date: "", category:"" }}
  validate={(values) => {
    const errors: {
      incomeTitle?: string
      amount?: string
      date?: string
      category?: string
    } = {}

    if (!values.incomeTitle.trim()) {
      errors.incomeTitle = "Income title is required"
    }

    if (!values.amount || Number(values.amount) <= 0) {
      errors.amount = "Enter a valid amount"
    }

    if (!values.date) {
      errors.date = "Date is required"
    }

     if (!values.category.trim()) {
      errors.category = "Category is required"
    }

    return errors
  }}
  onSubmit={async (values, { setSubmitting, resetForm }) => {
         setError('')
         setSuccess('')
         const userId = getUserId()
         if (!userId) {
           setError('Your session has expired. Please sign in again.')
           setSubmitting(false)
           return
         }
         try {
           const response = await fetch(`${API_BASE_URL}/api/auth/add-income`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               userId,
               incomeTitle: values.incomeTitle,
               amount: values.amount,
               date: formatDateForStorage(values.date),
               category: values.category,
             }),
           })

           const data = await response.json()

           if (!response.ok) {
             setError(data.message || 'Adding income failed.')
             return
           }

           setSuccess(data.message || 'Income added successfully.')
           resetForm()
           setTimeout(() => navigate('/'), 1200)
         } catch (err) {
           setError('Unable to reach the server. Please try again.')
         } finally {
           setSubmitting(false)
         }
       }}
>
  {({ errors, touched }) => (
    <Form className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="incomeTitle"
          className="mb-1.5 block text-[16px] font-semibold text-slate-800"
        >
          Income Title <sup className="text-red-600">*</sup>
        </label>

        <Field
          id="incomeTitle"
          name="incomeTitle"
          type="text"
          placeholder="Enter income title"
          className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${
            errors.incomeTitle && touched.incomeTitle
              ? "border-red-600 focus:border-red-600 focus:ring-red-200"
              : "border-slate-300 focus:border-gray-500 focus:ring-gray-200"
          }`}
        />
        <ErrorMessage
          name="incomeTitle"
          component="p"
          render={renderError} 
          className="mt-1 text-sm text-red-600"
        />
      </div>

      <div>
        <label
          htmlFor="amount"
          className="mb-1.5 block text-[16px] font-semibold text-slate-800"
        >
          Amount <sup className="text-red-600">*</sup>
        </label>

        <Field
          id="amount"
          name="amount"
          type="number"
         
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${
            errors.amount && touched.amount
              ? "border-red-600 focus:border-red-600 focus:ring-red-200"
              : "border-slate-300 focus:border-gray-500 focus:ring-gray-200"
          }`}
        />
        <ErrorMessage
          name="amount"
          component="p"
          className="mt-1 text-sm text-red-600"
           render={renderError} 
        />
      </div>

      <div>
        <label
          htmlFor="date"
          className="mb-1.5 block text-[16px] font-semibold text-slate-800"
        >
          Date <sup className="text-red-600">*</sup>
        </label>

        <Field
          id="date"
          name="date"
          type="date"
          aria-describedby="income-date-format"
          className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${
            errors.date && touched.date
              ? "border-red-600 focus:border-red-600 focus:ring-red-200"
              : "border-slate-300 focus:border-gray-500 focus:ring-gray-200"
          }`}
        />
        <p id="income-date-format" className="mt-1 text-xs text-slate-500">Format: DD/MM/YYYY</p>
        <ErrorMessage
          name="date"
          component="p"
          className="mt-1 text-sm text-red-600"
           render={renderError} 
        />
      </div>

       <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-[16px] font-semibold text-slate-800"
        >
          Category <sup className="text-red-600">*</sup>
        </label>

       <Field
         as="select"
            id="category"
            name="category"
            className={`w-full rounded-xl border bg-white px-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${
                errors.category && touched.category
                ? "border-red-600 focus:border-red-600 focus:ring-red-200"
                : "border-slate-300 focus:border-gray-500 focus:ring-gray-200"
            }`}
            >
            <option value="">Select a category</option>
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Business">Business</option>
            <option value="Investment">Investment</option>
            <option value="Rental Income">Rental Income</option>
            <option value="Gift">Gift</option>
            <option value="Other">Other</option>
            </Field>
            <ErrorMessage
          name="category"
          component="p"
          className="mt-1 text-sm text-red-600"
           render={renderError} 
        />
      </div>
           {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
            {success ? <p role="status" className="text-sm text-green-600">{success}</p> : null}
      <button
        type="submit"
        className="w-full rounded-xl bg-primary py-3 font-semibold text-white"
      >
        Add Income
      </button>
    </Form>
  )}
</Formik>
           </div>
        
        </>
    )
}