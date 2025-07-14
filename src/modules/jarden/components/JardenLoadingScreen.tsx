import React from 'react';

const JardenLoadingScreen: React.FC = () => {
  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center p-8 overflow-hidden" 
      style={{ backgroundColor: '#fdfcf9', backgroundImage: 'url("https://www.transparenttextures.com/patterns/exclusive-paper.png")' }}
    >
      <h1 className="text-6xl font-bold text-[#1D3117] tracking-widest mb-12" style={{ fontFamily: 'Manrope, sans-serif' }}>
        JARDEN
      </h1>
      <div className="relative w-48 h-32">
        {/* Watering Can */}
        <div className="absolute -top-4 -right-4 w-24 h-24" style={{ animation: 'tip-watering-can 4s ease-in-out infinite' }}>
          <svg viewBox="0 0 512 512" fill="#B6B6B6">
            <path d="M448 224h-64v-80c0-35.3-28.7-64-64-64h-32c-35.3 0-64 28.7-64 64v80H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h16v32c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32v-32h16c17.7 0 32-14.3 32-32s-14.3-32-32-32zM288 144c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32v80h-96v-80zm128 176c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32v-32h352v32z" />
          </svg>
          {/* Water Stream */}
          <div className="absolute top-full left-0 w-2 h-16 origin-top" style={{ background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0), rgba(147, 197, 253, 1))', transform: 'translateX(-10px) rotate(15deg)', animation: 'pour-water 4s ease-in-out infinite' }}></div>
        </div>
        {/* Plant and Soil */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12">
            {/* Plant */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-16 w-16 text-[#6C8C61]">
                <svg viewBox="0 0 100 100" fill="currentColor" className="animate-pulse" style={{ animationDuration: '3s' }}><path d="M50,100 C50,100 50,80 50,80 L50,80 C50,80 50,60 50,60 M50,60 C40,55 35,40 50,35 C65,40 60,55 50,60 M50,60 C40,70 30,80 50,80 C70,80 60,70 50,60" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round"></path></svg>
            </div>
            {/* Soil / Progress bar */}
             <div className="absolute bottom-0 left-0 w-full h-4 bg-[#DCEFD6] rounded-full overflow-hidden border border-[#B6B6B6]">
                <div className="h-full bg-[#6C8C61] rounded-full" style={{ animation: 'fill-water-bar 3s ease-out forwards' }}></div>
            </div>
        </div>
      </div>
      <p className="text-[#A67C52] mt-8 text-sm animate-pulse">Watering your garden...</p>
    </div>
  );
};

export default JardenLoadingScreen;
