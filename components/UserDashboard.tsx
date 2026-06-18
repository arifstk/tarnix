// components/UserDashboard.tsx


import React from 'react'
import Hero from './Hero'
import ProductsPage from './Products'
import TopSellingProducts from './TopSellingProducts'
import TopRatedProducts from './TopRatedProducts'
import NewArrivals from './NewArrivals'

const UserDashboard = () => {
  return (
    <div >
      {/* Banner */}
      <div className='p-4 md:p-6'>
        <Hero />
      </div>
      {/* <ProductsPage /> */}
      <TopSellingProducts />
      <TopRatedProducts limit={20} />
      <NewArrivals layout="grid" limit={20} />
    </div>
  )
}

export default UserDashboard

// Instead of Home page =====================

