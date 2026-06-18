// components/UserDashboard.tsx


import React from 'react'
import Hero from './Hero'
import ProductsPage from './Products'

const UserDashboard = () => {
  return (
    <div >
      {/* Banner */}
      <div className='p-4 md:p-6'>
        <Hero />
      </div>
      <ProductsPage />
    </div>
  )
}

export default UserDashboard

// Instead of Home page =====================

