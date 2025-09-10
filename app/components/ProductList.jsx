import React from 'react'

function ProductList({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <div className='sm:w-2/6 md:w-2/4  lg:w-2/6 xl:w-3/12 pb-11 relative my-j30 px-5'>
      <Link
        className="product-item"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        {product.featuredImage && (
          <div className='p-5 text-center'>
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading={loading}
              className='inline-block'
              sizes="(min-width: 45em) 400px, 100vw"
              style={{ width: '75%' }}
            />
          </div>
        )}
        <div className='text-center pt-5'>
          <h4 className='text-18 min-h-14'>{product.title}</h4>
          <small className='text-15 mb-4  text-brand flex justify-center gap-2 items-center'>
          Starting At: <span className='font-semibold text-22 text-blue'> <Money data={product.priceRange.minVariantPrice} /></span>
          </small>
          <div className='flex justify-center w-full'>
          <Link to={variantUrl} className='btn-secondary mt-4 absolute bottom-0'>
            Shop Now
          </Link>
          </div> 
        </div>
        <div className='absolute top-0 left-0 w-11 gap-y-j5 flex flex-wrap'>
            <img src="/image/super-sale_1.jpg" />
            <img src="/image/only-at-jerrys_1.jpg" />
            <img src="/image/sale_1.jpg" />
        </div>
      </Link>
    </div>
  );
}

export default ProductList
