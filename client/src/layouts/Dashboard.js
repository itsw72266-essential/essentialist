'use client'
import React from 'react'
import UserMenu from '../components/UserMenu'
import { useSelector } from 'react-redux'

const Dashboard = ({ children }) => {
  const user = useSelector(state => state.user)

  console.log("user dashboard", user)
  return (
    <section className='bg-white'>
        <div className='container   '>
                {/**left for menu */}
                {/* <div className='py-4 sticky top-24 max-h-[calc(100vh-96px)] overflow-y-auto hidden lg:block border-r'>
                    <UserMenu/>
                </div> */}


                {/**right for content */}
                <div className='bg-white min-h-[75vh] '>
                    {children}
                </div>
        </div>
    </section>
  )
}

export default Dashboard