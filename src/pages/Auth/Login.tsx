import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TbUser, TbLock, TbInfoTriangle } from "react-icons/tb";
import { setAuthenticated } from '../../utils/auth'
import { API_BASE_URL } from '../../utils/api'
const renderError = (message:string) =>{
  return (
    <div className="flex items-center gap-1 text-md text-red-600">
      <TbInfoTriangle className="text-red-600" />
       <span>{message}</span>
    </div>
  )
}
export const Login = () => {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading]= useState(false)

    return (
        <main className="flex flex-col min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#f5f8fe]">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-orange-100 bg-white/90 p-7 shadow-xl backdrop-blur sm:p-8">
                

                <h1 className="mt-2 text-3xl font-semibold text-indigo-900 text-center mb-2">Welcome Back</h1>
                <p className=" text-center text-slate-500">Sign in with your email and password.</p>
               
                      {success && (
                      <div className="my-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                          ✓
                        </div>

                        <div>
                          <p className="font-semibold">Login Successful!</p>
                          <p className="text-sm text-green-600">
                            Welcome back! Redirecting to your dashboard...
                          </p>
                        </div>
                      </div>
                    )}

                <Formik
       initialValues={{ email: '', password: '' }}
       validate={values => {
         const errors: { email?: string; password?: string } = {};
         if (!values.email) {
           errors.email = 'Enter your email';
         }
         if(!values.password){
           errors.password = 'Password is required';
         }
         return errors;
       }}
       
       onSubmit={async (values, { setSubmitting, resetForm, setFieldValue }) => {
         setError('')
         setSuccess('')
          setLoading(true);
         try {
           const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: values.email, password: values.password }),
           })

           const data = await response.json()

           if (!response.ok) {
             setError(data.message || 'Login failed.')
             setFieldValue('password', '')
             return
           }

           setSuccess(data.message || 'Login successful.')
           setAuthenticated(data.user.id)
           resetForm()
           setTimeout(() => navigate('/dashboard', { replace: true }), 1000)
         } catch (err) {
           setError('Unable to reach the server. Please try again.')
         } finally {
           setSubmitting(false)
            setLoading(false);
         }
       }}
     >
       {({ isSubmitting }) => (
          <Form className="mt-6 space-y-6">
            <div>
                        <label htmlFor="email" className="mb-1.5 block text-[16px] font-semibold text-slate-800">
                            Email <sup className="text-red-600">*</sup>
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <TbUser className="h-5 w-5" />
                            </span>
                            <Field
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="off"
                                className="w-full text-md rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                        <ErrorMessage name="email" render={renderError} component="div" className="text-md text-red-600" />
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
                                autoComplete="off"
                                className="w-full text-md rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-3.5 text-slate-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                         <ErrorMessage name="password" render={renderError} component="div" className="text-md text-red-600" />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    {/* {success ? <p className="text-sm text-green-600">{success}</p> : null} */}
                 
           <div className="mt-4">
             <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer text-lg rounded-full bg-primary hover:bg-secondary px-3.5 py-2.5 text-white transition  focus:outline-none focus:ring-2 focus:ring-orange-200">
                  {loading ? (
                    <>
                      <span className="loader"></span>
                      Logging in...
                    </>
                  ) : (
                    "Submit"
                  )}
             </button>
           </div>
         </Form>
       )}
     </Formik>
     
            </div>
             <h6 className='mt-8 text-center text-sm font-medium text-slate-600'>Do you have an account? <a href="/register" className="text-indigo-700 font-semibold underline hover:no-underline">Sign Up</a></h6>
        </main>
    )
}