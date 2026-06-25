// components/UserDashboard.tsx

import React from 'react'
import Hero from './Hero'
import ProductsPage from './Products'
import TopSellingProducts from './TopSellingProducts'
import TopRatedProducts from './TopRatedProducts'

const UserDashboard = () => {
  return (
    <div >
      {/* Banner */}
      <div className='pt-2 md:pt-4'>
        <Hero />
      </div>
      {/* <ProductsPage /> */}
      <TopSellingProducts />
      <TopRatedProducts />
    </div>
  )
}

export default UserDashboard

// Instead of Home page =====================

