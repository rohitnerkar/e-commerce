import React from 'react'

const ProductDescription = () => {
  return (
    <div className='mt-20'>
        <div className='flex gap-3 mb-4'>
            <button className="btn_dark_rounded !rounded-none !text-xs !py-[6px] w-36">Description</button>
            <button className="btn_dark_outline !rounded-none !text-xs !py-[6px] w-36">Care Guide</button>
            <button className="btn_dark_outline !rounded-none !text-xs !py-[6px] w-36">Size Guide</button>
        </div>
        <div className='flex flex-col pb-16'>
            <p className='text-sm'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
            Voluptates necessitatibus tempora voluptatum. Voluptates 
            necessitatibus tempora voluptatum. Ratione fuga ea temporibus 
            at necessitatibus, reprehenderit aliquam, aliquid atque quas 
            nobis consequuntur autem architecto saepe iure illo! Voluptates 
            necessitatibus tempora voluptatum.</p>
            <p className='text-sm'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. 
            Odio voluptas excepturi suscipit quasi cumque eum eius velit. 
            Rerum illum necessitatibus, ipsam inventore voluptatibus quasi 
            quis omnis et accusamus ea ratione!</p>
        </div>
    </div>
  )
}

export default ProductDescription
