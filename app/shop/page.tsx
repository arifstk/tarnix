import ProductsPage from '@/components/Products';
import React from 'react'

const page = () => {
  return (
    <div>
      <h2 className='text-4xl text-gray-800 font-bold pt-6 md:pt-10 text-center'>Shop</h2>
      <div>
        <ProductsPage />
      </div>
    </div>
  )
}

export default page;


