import React from 'react'

const MuseumBackground = () => {
  return (
    <>
      {/* Museum Background Layer - Mobile (Unchanged) */}
      <div 
        className="pointer-events-none fixed inset-x-0 bottom-0 h-full w-full z-0 opacity-100 mix-blend-multiply md:hidden"
        style={{
          backgroundImage: 'url("/museum_ri.png")',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 100%)'
        }}
      />
      {/* Museum Background Layer - Desktop (Softened, Blurred, & Stronger Fade) */}
      <div 
        className="pointer-events-none fixed inset-x-0 bottom-0 h-full w-full z-0 hidden md:block opacity-60 mix-blend-multiply blur-[2px]"
        style={{
          backgroundImage: 'url("/museum_ri.png")',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 60%, black 100%)'
        }}
      />
    </>
  )
}

export default MuseumBackground
