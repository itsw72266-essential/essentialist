//Path: client/src/components/AddAddress.jsx
"use client"
import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../providers/GlobalProvider'

const AddAddress = ({close}) => {
    const { register, handleSubmit, reset } = useForm()
    const { fetchAddress } = useGlobalContext()

    const onSubmit = async(data)=>{
        console.log("data",data)
    
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data : {
                    name : data.name,
                    customer_email : data.email,
                    address_line :data.addressline,
                    city : data.city,
                    state : data.state,
                    country : data.country,
                    pincode : data.pincode,
                    mobile : data.mobile
                }
            })

            const { data : responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }
  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto flex items-start justify-center'>
        <div className='bg-white p-4 w-full md:w-1/2 max-w-lg my-8 mx-auto rounded shadow-lg'>
            <div className='flex justify-between items-center gap-4 border-b pb-2'>
                <h2 className='font-bold text-lg'>Add Address</h2>
                <button onClick={close} className='hover:text-red-500 transition-colors'>
                    <IoClose size={25}/>
                </button>
            </div>
            <form className='mt-4 grid gap-3' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid gap-1'>
                    <label htmlFor='name' className='font-medium'>Name:</label>
                    <input
                        type='text'
                        id='name' 
                        className='border bg-blue-100 p-2 rounded'
                        {...register("name",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='email' className='font-medium'>Email:</label>
                    <input
                        type='email'
                        id='email' 
                        className='border bg-blue-100 p-2 rounded'
                        {...register("email",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='addressline' className='font-medium'>Address Line/Quarter:</label>
                    <input
                        type='text'
                        id='addressline' 
                        className='border bg-blue-100 p-2 rounded'
                        {...register("addressline",{required : true})}
                    />
                </div>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div className='grid gap-1'>
                        <label htmlFor='city' className='font-medium'>City:</label>
                        <input
                            type='text'
                            id='city' 
                            className='border bg-blue-100 p-2 rounded'
                            {...register("city",{required : true})}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='state' className='font-medium'>State/Region:</label>
                        <input
                            type='text'
                            id='state' 
                            className='border bg-blue-100 p-2 rounded'
                            {...register("state",{required : true})}
                        />
                    </div>
                </div>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div className='grid gap-1'>
                        <label htmlFor='pincode' className='font-medium'>Pincode:</label>
                        <input
                            type='text'
                            id='pincode' 
                            className='border bg-blue-100 p-2 rounded'
                            {...register("pincode",{required : true})}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='country' className='font-medium'>Country:</label>
                        <input
                            type='text'
                            id='country' 
                            className='border bg-blue-100 p-2 rounded'
                            {...register("country",{required : true})}
                        />
                    </div>
                </div>
                
                <div className='grid gap-1'>
                    <label htmlFor='mobile' className='font-medium'>Mobile No.:</label>
                    <input
                        type='text'
                        id='mobile' 
                        className='border bg-blue-100 p-2 rounded'
                        {...register("mobile",{required : true})}
                    />
                </div>

                <button 
                    type='submit' 
                    className='bg-primary-200 w-full py-2.5 rounded font-bold text-base mt-4 hover:bg-primary-100 transition-colors shadow-md sticky bottom-0 focus:outline-none focus:ring-2 focus:ring-primary-100'
                >
                    SUBMIT
                </button>
            </form>
        </div>
    </section>
  )
}

export default AddAddress