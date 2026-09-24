import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TbInfoTriangle, TbUser, TbMail, TbPhone, TbLock } from "react-icons/tb";
import { API_BASE_URL } from '../../utils/api'
const renderError = (message: string) => (
    <div className="flex items-center gap-1 text-md text-red-600">
        <TbInfoTriangle className="text-red-600" />
        <span>{message}</span>
    </div>
)

export const Register = () => {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    return (
        <main className="flex flex-col min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#f5f8fe]">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-orange-100 bg-white/90 p-7 shadow-xl backdrop-blur sm:p-8">
                

                <h1 className="mt-2 text-3xl font-semibold text-indigo-900 text-center mb-2">Create Account</h1>
                <p className=" text-center text-slate-500">Sign up to get started.</p>
               
                   

                <Formik
       initialValues={{ username: '', email:'', contact: '', password: '', confirmPassword: '' }}
       validate={values => {
         const errors: Record<string, string> = {};
         if (!values.username) {
           errors.username = 'Enter your username';
         }
         if(!values.password){
           errors.password = 'Password is required';
         }
         if(!values.email){
           errors.email = 'Email is required';
         }
         if(!values.contact){
           errors.contact = 'Mobile number is required';
         }
         if(!values.confirmPassword){
           errors.confirmPassword = 'Confirm your password';
         } else if(values.confirmPassword !== values.password){
           errors.confirmPassword = 'Passwords do not match';
         }
         return errors;
       }}
       
       onSubmit={async (values, { setSubmitting, resetForm }) => {
         setError('')
         setSuccess('')
         try {
           const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               name: values.username,
               email: values.email,
               mobile: values.contact,
               password: values.password,
             }),
           })

           const data = await response.json()

           if (!response.ok) {
             setError(data.message || 'Registration failed.')
             return
           }

           setSuccess(data.message || 'Registration successful.')
           resetForm()
           setTimeout(() => navigate('/'), 1200)
         } catch (err) {
           setError('Unable to reach the server. Please try again.')
         } finally {
           setSubmitting(false)
         }
       }}
     >
       {({ isSubmitting, errors, touched }) => (
          <Form className="mt-6 space-y-4">
            <div>
                        <label htmlFor="username" className="mb-1.5 block text-[16px] font-semibold text-slate-800">
                           Name <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <TbUser className="h-5 w-5" />
                            </span>
                            <Field
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                autoComplete="username"
                                className={`w-full text-md rounded-xl border bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${errors.username && touched.username ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : 'border-slate-300 focus:border-gray-500 focus:ring-gray-200'}`}
                            />
                        </div>
                        <ErrorMessage name="username" render={renderError} />
                    </div>
          
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-[16px] font-semibold text-slate-800">
                           Email <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <TbMail className="h-5 w-5" />
                            </span>
                            <Field
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                className={`w-full text-md rounded-xl border bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${errors.email && touched.email ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : 'border-slate-300 focus:border-gray-500 focus:ring-gray-200'}`}
                            />
                        </div>
                        <ErrorMessage name="email" render={renderError} />
                    </div>

                    <div>
                        <label htmlFor="contact" className="mb-1.5 block text-[16px] font-semibold text-slate-800">
                           Mobile Number <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <TbPhone className="h-5 w-5" />
                            </span>
                            <Field
                                id="contact"
                                type="text"
                                name="contact"
                                placeholder="Enter your mobile number"
                                autoComplete="tel"
                                className={`w-full text-md rounded-xl border bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${errors.contact && touched.contact ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : 'border-slate-300 focus:border-gray-500 focus:ring-gray-200'}`}
                            />
                        </div>
                        <ErrorMessage name="contact" render={renderError} />
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-[16px] font-semibold text-slate-800">
                           Password <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <TbLock className="h-5 w-5" />
                            </span>
                            <Field
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className={`w-full text-md rounded-xl border bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${errors.password && touched.password ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : 'border-slate-300 focus:border-gray-500 focus:ring-gray-200'}`}
                            />
                        </div>
                        <ErrorMessage name="password" render={renderError} />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="mb-1.5 block text-[16px] font-semibold text-slate-800">
                           Confirm Password <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <TbLock className="h-5 w-5" />
                            </span>
                            <Field
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                className={`w-full text-md rounded-xl border bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:ring-2 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : 'border-slate-300 focus:border-gray-500 focus:ring-gray-200'}`}
                            />
                        </div>
                        <ErrorMessage name="confirmPassword" render={renderError} />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    {success ? <p className="text-sm text-green-600">{success}</p> : null}
           <div className="mt-4">
             <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer text-lg rounded-full bg-primary hover:bg-secondary px-3.5 py-2.5 text-white transition focus:outline-none focus:ring-2 focus:ring-orange-200">
               Create Account
             </button>
           </div>
         </Form>
       )}
     </Formik>
     
            </div>
             <h6 className='mt-8 text-center text-sm font-medium text-slate-600'>Already have an account?s <a href="/" className="text-indigo-700 font-semibold underline hover:no-underline">Login</a></h6>
        </main>
    )
}