
import React from 'react';

// This SVG combines the radial gradient and the subtle light streaks from the screenshot into a single, efficient background image.
const heroBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25' fx='50%25' fy='50%25'%3E%3Cstop offset='0%25' stop-color='%23164A41' /%3E%3Cstop offset='100%25' stop-color='%230A1A10' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Cg stroke='%23ffffff' stroke-opacity='0.07' stroke-width='0.5'%3E%3Cpath d='M-100 900 C400 600 800 400 1700 0' fill='none' /%3E%3Cpath d='M-200 900 C300 500 900 300 1800 0' fill='none' /%3E%3Cpath d='M-300 900 C200 400 1000 200 1900 0' fill='none' /%3E%3C/g%3E%3C/svg%3E")`;


const LandingPage: React.FC = () => {
  return (
    // Main container with a base dark color
    <div className="relative w-full h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-[#0A1A10]">
      
      {/* Layer 1: Static background that mimics the reference screenshot */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: heroBackground
        }}
      ></div>

      {/* Layer 2: Content */}
      <div className="relative z-30 text-center px-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4" style={{textShadow: '0 4px 15px rgba(0,0,0,0.3)'}}>
          Empowering<br />Sustainable Living
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-12">
          Join our community of sustainability enthusiasts. Access knowledge,
          tools, and connect with like-minded individuals committed to a greener
          future.
        </p>

        {/* Animated Button Container */}
        <div className="relative inline-block animate-breathe">
           {/* The spinning glow effect */}
          <div 
             className="absolute -inset-1.5 bg-[conic-gradient(from_180deg_at_50%_50%,#ADFF2F_0%,#0a1a10_40%,#0a1a10_60%,#ADFF2F_100%)] 
                        rounded-full animate-spin-glow blur-2xl opacity-75"
          ></div>
          {/* The actual button */}
          <button 
            className="relative bg-[#9acd32] text-gray-900 font-bold py-4 px-10 rounded-full text-lg 
                       transition-colors duration-300
                       shadow-2xl shadow-lime-500/30"
          >
            Breed Life
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
