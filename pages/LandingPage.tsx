
import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon, Bars3Icon, BookOpenIcon, HomeModernIcon } from '@heroicons/react/24/outline';


const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-50 text-white">
      <div className="w-full flex justify-between items-center px-6 lg:px-8 py-4 relative z-10" style={{ background: 'linear-gradient(to bottom, rgba(2, 4, 10, 0.7) 0%, rgba(2, 4, 10, 0) 100%)' }}>
        <Link to="/" className="text-xl font-bold tracking-widest" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>SENANDE.LIFE</Link>
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <nav className="flex items-center space-x-6 lg:space-x-8 text-white/90">
            <Link to="/educa" className="text-sm hover:text-white transition-colors duration-300">Educa</Link>
            <Link to="/jarden" className="text-sm hover:text-white transition-colors duration-300">Jarden</Link>
            <Link to="/about" className="text-sm opacity-60 hover:opacity-100 hover:text-white transition-colors duration-300">About</Link>
          </nav>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true"></div>
          <div id="mobile-menu" className="fixed top-0 right-0 bottom-0 w-72 bg-[#02040a]/95 backdrop-blur-lg shadow-2xl z-40 animate-slide-in-right md:hidden">
            <div className="p-4 flex justify-end border-b border-lime-300/10 relative">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 rounded-md"><XMarkIcon className="h-6 w-6" /></button>
                <div className="absolute bottom-[-1px] left-0 right-0 h-px w-full overflow-hidden">
                    <div 
                        className="h-full animate-breathing-line" 
                        style={{
                            backgroundImage: 'linear-gradient(to right, transparent, rgba(163, 230, 53, 0.7), transparent)',
                            backgroundSize: '50% 100%',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </div>
            </div>
            <nav className="flex flex-col space-y-2 p-4">
              <Link to="/educa" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg">Educa</Link>
              <Link to="/jarden" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg">Jarden</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg">About</Link>
            </nav>
          </div>
        </>
      )}
       <div className="absolute bottom-0 left-0 right-0 h-px w-full overflow-hidden">
        <div 
            className="h-full animate-breathing-line" 
            style={{
                backgroundImage: 'linear-gradient(to right, transparent, rgba(163, 230, 53, 0.7), transparent)',
                backgroundSize: '50% 100%',
                backgroundRepeat: 'no-repeat',
            }}
        />
      </div>
    </header>
  );
};

const TreeOfLifeSVG = ({ scrollProgress }: { scrollProgress: number }) => {
  const trunkRef = useRef<SVGPathElement>(null);
  const branch1Ref = useRef<SVGPathElement>(null);
  const branch2Ref = useRef<SVGPathElement>(null);
  const canopyRef = useRef<SVGPathElement>(null);
  const rootsRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    [trunkRef, branch1Ref, branch2Ref, canopyRef, rootsRef].forEach(ref => {
      if (ref.current) {
        const length = ref.current.getTotalLength();
        ref.current.style.strokeDasharray = `${length}`;
        ref.current.style.strokeDashoffset = `${length}`;
      }
    });
  }, []);

  useEffect(() => {
    const refs = [
      { ref: rootsRef, start: 0.85, end: 1.0 },
      { ref: trunkRef, start: 0, end: 0.9 },
      { ref: canopyRef, start: 0, end: 0.2 },
      { ref: branch1Ref, start: 0.3, end: 0.5 },
      { ref: branch2Ref, start: 0.55, end: 0.75 }
    ];

    refs.forEach(({ ref, start, end }) => {
        if (ref.current) {
            const length = ref.current.getTotalLength();
            const progressInRange = Math.max(0, Math.min(1, (scrollProgress - start) / (end - start)));
            const drawLength = length * progressInRange;
            ref.current.style.strokeDashoffset = `${length - drawLength}`;
        }
    });

  }, [scrollProgress]);

  return (
    <svg viewBox="0 0 1000 4200" className="fixed inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="xMaxYMax meet">
      <defs>
        <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
        </linearGradient>
        <filter id="treeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#treeGlow)" opacity="0.9">
        {/* Intricate Roots */}
        <path ref={rootsRef} d="
          M950,4200 C 970,4150, 930,4100, 940,4050 
          M950,4200 C 930,4160, 960,4120, 920,4080
          M950,4200 C 900,4180, 880,4150, 890,4100
          M950,4200 C 880,4190, 850,4120, 860,4070
        " stroke="url(#treeGradient)" strokeWidth="15" strokeLinecap="round" fill="none" style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
        {/* Main Trunk */}
        <path ref={trunkRef} d="M950,4200 C 900,3900 1000,3600 900,3300 C800,3000 950,2200 850,1400 C750,800 650,400 500,200" stroke="url(#treeGradient)" strokeWidth="35" strokeLinecap="round" fill="none" style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
        {/* Canopy */}
        <path ref={canopyRef} d="M500,200 Q 300,150 200,300 Q 100,450 300,500 Q 500,550 700,500 Q 900,450 800,300 Q 700,150 500,200" stroke="url(#treeGradient)" strokeWidth="25" strokeLinecap="round" fill="none" style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
        {/* Section Branches */}
        <path ref={branch1Ref} d="M885,3050 C 600,3100, 300,2950, 100,3150" stroke="url(#treeGradient)" strokeWidth="20" strokeLinecap="round" fill="none" style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
        <path ref={branch2Ref} d="M830,1600 C 600,1650, 300,1500, 100,1700" stroke="url(#treeGradient)" strokeWidth="20" strokeLinecap="round" fill="none" style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
      </g>
    </svg>
  );
};

const ModuleCard: React.FC<{ icon: React.ElementType; title: string; description: string; link: string;}> = ({ icon: Icon, title, description, link }) => (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center transform hover:scale-105 hover:border-lime-400/50 transition-all duration-300 ease-in-out shadow-lg">
        <Icon className="h-12 w-12 mx-auto mb-4 text-lime-300"/>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-white/70 mb-6 text-sm">{description}</p>
        <Link to={link} className="inline-block bg-lime-300/20 text-lime-200 hover:bg-lime-300/40 font-semibold px-6 py-2 rounded-full transition-all duration-300 ease-in-out shadow-md hover:shadow-lg">
            Learn More
        </Link>
    </div>
);

// --- New Breed Life Button Component and its Icons ---
const Icon1 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 26.3 65.33"
    version="1.1"
    xmlSpace="preserve"
    className="fill-current"
  >
    <path d="M13.98 52.87c0.37,-0.8 0.6,-1.74 0.67,-2.74 1.01,1.1 2.23,2.68 1.24,3.87 -0.22,0.26 -0.41,0.61 -0.59,0.97 -2.95,5.89 3.44,10.87 2.98,0.78 0.29,0.23 0.73,0.82 1.03,1.18 0.33,0.4 0.7,0.77 1,1.15 0.29,0.64 -0.09,2.68 1.77,4.91 5.42,6.5 5.67,-2.38 0.47,-4.62 -0.41,-0.18 -0.95,-0.26 -1.28,-0.54 -0.5,-0.41 -1.23,-1.37 -1.66,-1.9 0.03,-0.43 -0.17,-0.13 0.11,-0.33 4.98,1.72 8.4,-1.04 2.38,-3.16 -1.98,-0.7 -2.9,-0.36 -4.72,0.16 -0.63,-0.58 -2.38,-3.82 -2.82,-4.76 1.21,0.56 1.72,1.17 3.47,1.3 6.5,0.5 2.31,-4.21 -2.07,-4.04 -1.12,0.04 -1.62,0.37 -2.49,0.62l-1.25 -3.11c0.03,-0.26 0.01,-0.18 0.1,-0.28 1.35,0.86 1.43,1 3.25,1.45 2.35,0.15 3.91,-0.15 1.75,-2.4 -1.22,-1.27 -2.43,-2.04 -4.22,-2.23l-2.08 0.13c-0.35,-0.58 -0.99,-2.59 -1.12,-3.3l-0.01 -0.01 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0c-0.24,-0.36 1.88,1.31 2.58,1.57 1.32,0.49 2.6,0.33 3.82,0 -0.37,-1.08 -1.17,-2.31 -2.13,-3.11 -1.79,-1.51 -3.07,-1.41 -5.22,-1.38l-0.93 -4.07c0.41,-0.57 1.41,0.9 2.82,1.36 0.96,0.31 1.94,0.41 3,0.14 2,-0.52 -2.25,-4.4 -4.53,-4.71 -0.7,-0.1 -1.23,-0.04 -1.92,-0.03 -0.46,-0.82 -0.68,-3.61 -0.92,-4.74 0.8,0.88 1.15,1.54 2.25,2.23 0.8,0.5 1.58,0.78 2.57,0.85 2.54,0.18 -0.1,-3.47 -0.87,-4.24 -1.05,-1.05 -2.34,-1.59 -4.32,-1.78l-0.33 -3.49c0.83,0.67 1.15,1.48 2.3,2.16 1.07,0.63 2.02,0.89 3.58,0.79 0.15,-1.34 -1.07,-3.39 -2.03,-4.3 -1.05,-0.99 -2.08,-1.47 -3.91,-1.68l-0.07 -3.27 0.32 -0.65c0.44,0.88 1.4,1.74 2.24,2.22 0.69,0.39 2.4,1.1 3.44,0.67 0.31,-1.92 -1.84,-4.49 -3.5,-5.29 -0.81,-0.39 -1.61,-0.41 -2.18,-0.68 -0.12,-1.28 0.27,-3.23 0.37,-4.55l-0.89 0c-0.06,1.28 -0.35,3.12 -0.34,4.31 -0.44,0.45 -0.37,0.42 -0.96,0.64 -3.88,1.49 -4.86,6.38 -3.65,7.34 1.42,-0.31 3.69,-2.14 4.16,-3.66 0.23,0.5 0.1,2.36 0.05,3.05 -1.23,0.4 -2.19,1.05 -2.92,1.82 -1.17,1.24 -2.36,4.04 -1.42,5.69 1.52,0.09 4.07,-2.49 4.49,-4.07l0.29 3.18c-2.81,0.96 -5.01,3.68 -4.18,7.43 2.06,-0.09 3.78,-2.56 4.66,-4.15 0.23,1.45 0.67,3.06 0.74,4.52 -1.26,0.93 -2.37,1.8 -2.97,3.55 -0.48,1.4 -0.49,3.72 0.19,4.55 0.59,0.71 2.06,-1.17 2.42,-1.67 1,-1.35 0.81,-1.92 1.29,-2.46l0.7 3.44c-0.49,0.45 -0.94,0.55 -1.5,1.19 -1.93,2.23 -2.14,4.33 -1.01,6.92 0.72,0.09 2.04,-1.4 2.49,-2.06 0.65,-0.95 0.79,-1.68 1.14,-2.88l0.97 2.92c-0.2,0.55 -1.84,1.32 -2.6,3.62 -0.54,1.62 -0.37,3.86 0.67,4.93 0.58,-0.09 1.85,-1.61 2.2,-2.19 0.66,-1.09 0.66,-1.64 1,-2.93l1.32 3.18c-0.23,0.72 -1.63,1.72 -1.82,4.18 -0.17,2.16 1.11,6.88 3.13,2.46zm-4.09 -16.89l-0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 -0 0.01 0.01z" />
  </svg>
);

const Icon2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 11.67 37.63"
    version="1.1"
    xmlSpace="preserve"
    className="fill-current"
  >
    <path d="M7.63 35.26c-0.02,0.13 0.01,0.05 -0.06,0.14 -0,0 -0.08,0.07 -0.11,0.1 -0.42,0.25 -0.55,0.94 -0.23,1.4 0.68,0.95 2.66,0.91 3.75,0.21 0.2,-0.13 0.47,-0.3 0.57,-0.49 0.09,-0.02 0.04,0.03 0.11,-0.07l-1.35 -1.24c-0.78,-0.78 -1.25,-1.9 -2.07,-0.62 -0.11,0.18 -0.06,0.16 -0.22,0.26 -0.4,-0.72 -0.95,-1.79 -1.26,-2.59 0.82,0.02 1.57,-0.12 2.16,-0.45 0.49,-0.27 1.15,-0.89 1.33,-1.4 0.1,-0.06 0.02,0.01 0.06,-0.1 -0.24,-0.16 -0.87,-0.37 -1.19,-0.52 -0.4,-0.19 -0.73,-0.39 -1.09,-0.62 -0.25,-0.16 -0.85,-0.6 -1.18,-0.3 -0.35,0.32 -0.32,0.83 -0.53,1.17 -0.71,-0.3 -0.55,-0.26 -0.84,-1.22 -0.15,-0.5 -0.31,-1.12 -0.41,-1.66l0.03 -0.13c0.56,0.23 1.28,0.37 1.99,0.28 0.56,-0.07 1.33,-0.42 1.62,-0.71l0.1 -0.1c-0.74,-0.68 -1.09,-1.2 -1.65,-1.99 -1.09,-1.52 -1.2,-0.28 -1.92,0.17 -0.26,-0.79 -0.73,0.2 -0.12,-2.76 0.06,-0.3 0.19,-0.7 0.2,-0.98 0.18,0.08 0.01,-0.01 0.11,0.08 0.05,0.05 0.07,0.07 0.1,0.12 0.94,1.17 3.63,0.82 4.21,0.01 0.13,-0.02 0.06,0.03 0.1,-0.1 -1.14,-0.81 -1.91,-2.89 -2.58,-2.67 -0.29,0.09 -0.78,0.63 -0.93,0.87 -0.54,-0.48 -0.36,-0.63 -0.38,-0.81 0.01,-0.01 0.03,-0.04 0.03,-0.03 0.01,0.02 0.36,-0.35 0.45,-0.6 0.13,-0.35 0.04,-0.65 -0.05,-0.95 0.06,-0.41 0.33,-1.33 0.28,-1.71 0.22,-0.05 0.19,0.05 0.45,0.17 0.47,0.23 1.17,0.33 1.7,0.32 0.62,-0 1.74,-0.39 1.94,-0.75 0.14,-0.02 0.05,0.06 0.13,-0.09 -1.05,-1.1 -0.7,-0.64 -1.62,-1.92 -0.58,-0.81 -0.9,-1.27 -1.9,0.12 -0.44,-0.5 -0.64,-0.69 -0.66,-1.24 0.02,-0.31 0.15,-0.36 0.08,-0.73 -0.04,-0.24 -0.14,-0.41 -0.29,-0.59l-0.47 -2.54c0.09,-0.14 -0.09,-0.1 0.2,-0.05 0.06,0.01 0.19,0.05 0.3,0.07 0.54,0.09 1.47,0.01 1.95,-0.15 0.57,-0.19 1.53,-0.8 1.68,-1.18 0.16,-0.07 0.05,0.02 0.15,-0.13 -0.12,-0.15 -0.95,-0.65 -1.15,-0.8 -1.43,-1.08 -2.21,-2.77 -3.16,-0.38 -0.2,-0.1 -0.75,-0.55 -0.83,-0.74 -0.15,-0.35 -0.21,-0.81 -0.37,-1.15l-0.1 -0.25c-0.03,-0.3 -0.44,-1.33 -0.57,-1.64 -0.2,-0.51 -0.47,-1.09 -0.64,-1.6l-0.55 0c0.14,0.42 0.36,0.84 0.53,1.28 0.12,0.3 0.19,0.35 0.06,0.66l-0.21 0.52c-0.01,0.01 -0.01,0.02 -0.02,0.03 -0.06,0.1 -0.03,0.05 -0.06,0.09 -1.44,-1.03 -1.66,-0.73 -2.07,0.46 -0.16,0.46 -0.3,0.93 -0.5,1.36l-0.64 1.28c0.06,0.07 -0,0.03 0.1,0.03 0.05,0.05 0.02,0.03 0.1,0.08l0.49 0.14c0.23,0.05 0.44,0.09 0.66,0.1 0.55,0.04 0.94,-0.06 1.35,-0.19 0.54,-0.18 1.09,-0.44 1.5,-0.82 0.15,-0.14 0.24,-0.3 0.4,-0.41l0.46 1.66c0.03,0.74 -0.09,0.6 0.27,1.21 0.01,0.01 0.01,0.02 0.02,0.03 0.01,0.01 0.01,0.02 0.02,0.04l0.07 0.11c-0.02,0.22 0.19,1.01 0.24,1.29 0.09,0.46 -0.21,0.79 -0.3,1.2 -0.55,-0.23 -1.25,-1.06 -1.66,-0.23 -0.12,0.25 -0.17,0.36 -0.26,0.62 -0.33,1.01 -0.63,1.61 -1.06,2.43l0.12 0.04 0.23 0.11c0.06,0.02 0.17,0.04 0.25,0.06 0.17,0.04 0.34,0.08 0.52,0.09 0.29,0.02 0.93,0.07 1.12,-0.13 0.42,0.01 1.24,-0.49 1.51,-0.71 0.01,0.01 0.03,0 0.04,0.02l0.09 0.06c-0.04,0.29 0.02,0.41 0.03,0.7l-0.05 1.41c-0.06,1.12 -0.29,1.06 -0.76,1.69 -0.08,-0.07 -0.03,-0.01 -0.11,-0.11 -0.03,-0.03 -0.06,-0.08 -0.09,-0.11 -0.2,-0.25 -0.38,-0.54 -0.7,-0.69 -0.7,-0.32 -1.52,1.73 -2.82,2.61 0.04,0.2 -0.01,0.06 0.1,0.11 0.25,0.3 1,0.67 1.5,0.78 0.35,0.08 0.71,0.08 1.09,0.05 0.25,-0.02 0.82,-0.16 0.92,-0.13 -0.16,0.69 -0.35,1.35 -0.52,2.03 -0.25,1 -0.03,0.77 -0.98,1.53 -0.3,-0.31 -0.33,-0.77 -0.77,-1.02 -0.42,-0.25 -0.91,0.35 -1.12,0.55 -0.33,0.32 -0.58,0.6 -0.97,0.89 -0.19,0.14 -0.34,0.26 -0.53,0.4 -0.14,0.11 -0.43,0.29 -0.53,0.4 0.1,0.15 -0.02,0.06 0.15,0.13 0.09,0.22 0.35,0.38 0.54,0.52 0.22,0.16 0.43,0.29 0.69,0.39 0.43,0.17 1.32,0.31 1.87,0.23l0.23 -0.05c0.01,-0 0.03,-0.02 0.04,-0.02 0.01,-0 0.02,-0.01 0.03,-0.02 0.32,0.05 0.52,-0.18 0.79,-0.24l-0.02 0.66c0,0.77 -0.24,0.75 0.16,1.51l0.04 0.07c0,0.01 0.01,0.03 0.02,0.04 -0.05,0.35 0.18,1.03 0.24,1.4 -0.23,0.18 -0.34,0.33 -0.51,0.41 -0.75,-1.17 -0.82,-1.52 -1.92,-0.43 -0.32,0.31 -0.59,0.57 -0.95,0.86 -0.23,0.19 -0.95,0.65 -1.05,0.81l0.13 0.1c0.88,1.15 3.14,1.5 4.1,0.82 0.47,-0.34 0.54,-0.56 0.52,-1.34l0.67 1.84c0.03,0.16 0.06,0.28 0.12,0.42 0.03,0.06 0.05,0.12 0.09,0.17 0.1,0.15 0.03,0.06 0.13,0.14 -0,0.29 0.14,0.22 0.06,0.56 -0.03,0.13 -0.14,0.43 -0.19,0.53 -1.94,-1.27 -1.57,-0.02 -2.28,1.76 -0.16,0.41 -0.37,0.77 -0.53,1.2 0.09,0.08 0.01,0.03 0.15,0.03 0.29,0.33 1.66,0.28 2.36,-0.01 0.48,-0.2 0.96,-0.46 1.3,-0.82 0.15,-0.16 0.16,-0.3 0.38,-0.33 0.14,0.08 0.17,0.19 0.27,0.36zm-3.62 -12.85c0.13,-0.01 0.31,-0.15 0.55,-0.19 -0.01,0.45 0.02,0.74 -0.34,0.45 -0.06,-0.05 -0.09,-0.06 -0.12,-0.09 -0.09,-0.1 -0.04,-0.01 -0.09,-0.17zm1.92 -12.29l-0.04 0.13c-0.07,-0.02 -0.17,-0.02 -0.21,-0.03 -0.27,-0.08 -0.09,0.04 -0.16,-0.16 0.12,-0.08 0.18,-0.23 0.34,-0.35l0.08 0.4zm1.33 3.05l-0.4 0.17c-0,-0.08 -0,-0.15 -0.02,-0.23 -0.02,-0.09 -0.03,-0.07 -0.05,-0.11l0.07 -0.16c0.21,0.11 0.28,0.16 0.4,0.32zm-1.54 6.48l0.16 -0.51c0.17,0.07 0.25,0.14 0.36,0.29l-0.52 0.22zm0.28 10.88l-0.09 -0.38 0.37 0.07c-0.02,0.1 -0.03,0.13 -0.09,0.19 -0.13,0.15 0.01,0.06 -0.19,0.12zm-1.05 -5.97c0.06,0.12 0.16,0.16 0.26,0.23 -0.09,0.14 -0.22,0.18 -0.37,0.21 -0,-0.02 -0.02,-0.27 -0.02,-0.27 0.04,-0.19 -0.06,-0.09 0.13,-0.16zm1.03 -8.01c-0.09,-0.02 -0.15,-0.02 -0.22,-0.07 -0.21,-0.13 -0.08,-0.02 -0.14,-0.18 0.15,-0.05 0.21,-0.15 0.45,-0.24l-0.08 0.48zm0.57 16.58l-0.45 -0c0.02,-0.18 0.12,-0.3 0.26,-0.42l0.18 0.42zm-1.45 -3.7l-0.19 -0.23c-0.06,-0.07 -0.1,-0.13 -0.17,-0.19 -0.24,-0.23 -0.29,-0.14 -0.36,-0.36l0.46 -0.19c0.07,0.14 0.25,0.78 0.26,0.97zm0.37 -23.67l-0.12 -0.57 0.54 0.21c-0.07,0.16 -0.27,0.31 -0.41,0.36zm-1.46 -3.02c-0.07,0.01 -0.19,-0.04 -0.3,-0.06 -0.04,-0.01 -0.14,-0.02 -0.18,-0.03 -0.15,-0.07 -0.06,0.04 -0.14,-0.13 0.11,-0.07 0.2,-0.27 0.37,-0.4 0.13,0.13 0.2,0.43 0.24,0.62z" />
  </svg>
);

const Icon3 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25.29 76.92"
    version="1.1"
    xmlSpace="preserve"
    className="fill-current"
  >
    <path d="M19.14 6.58c0.09,0.1 -0.02,0.03 0.17,0.15 0.04,0.03 0.19,0.09 0.27,0.13l0.16 0.02c0.12,0.14 0.02,0.06 0.22,0.18 0.63,0.37 1.81,0.52 2.51,0.53 0.42,-0.26 0.61,-1.58 0.55,-2.27 -0.11,-1.17 -1.02,-3.42 -2.17,-3.76 -0.84,-0.25 -1.19,0.02 -1.4,0.7 -0.03,0.1 -0.05,0.19 -0.09,0.28l-0.18 0.25c-0.18,-0.36 -0.77,-0.97 -1.2,-1.18 -0.64,-0.31 -0.36,-0.26 -0.84,-1.59l-0.75 0c0.2,0.63 0.44,1.27 0.61,1.92 0.17,0.64 0.47,1.46 0.58,2.05 -0.21,0.36 -0.43,0.5 -0.31,1.1 0.11,0.51 0.35,0.71 0.76,0.9 0.13,0.31 0.36,1.33 0.39,1.78 -0.68,0.24 -1.38,0.85 -1.62,1.43 -0.45,-0.47 -0.29,-1.59 -1.59,-1.22 -0.8,0.22 -1.09,0.8 -1.45,1.52 -0.58,1.18 -0.96,2.15 -0.6,3.58 0.04,0.17 0.13,0.4 0.19,0.55 0.11,0.29 0.09,0.34 0.35,0.44 1.74,-0.01 2.96,-0.82 4.13,-1.55 0.22,-0.13 0.65,-0.39 0.79,-0.62 0.74,-1.2 -0.74,-2.14 -1.7,-2.43 -0.01,-0.51 1.07,-0.87 1.7,-0.82 0.21,1.74 0.56,3.5 0.61,5.33 0.05,2.05 0.01,3.68 -0.08,5.71 -1.2,0.52 -0.99,0.65 -1.77,1.46 -0.39,-0.45 -0.22,-1.6 -1.59,-1.18 -0.79,0.24 -0.91,0.63 -1.42,1.55 -0.78,1.41 -0.95,2.66 -0.36,4.15 0.14,0.35 0.06,0.36 0.36,0.37 0.78,-0 1.47,-0.18 2.09,-0.43 0.51,-0.2 1.26,-0.76 1.69,-0.86 -0.18,0.3 -0.34,0.91 -0.48,1.25l-1.54 3.5c-1.75,0.08 -1.26,0.29 -2.27,0.59 0.1,-1.15 0.1,-1.69 -1.1,-1.78 -0.7,-0.05 -1.5,0.65 -1.91,0.96 -1.04,0.82 -1.93,1.81 -1.94,3.77 0.09,0.22 -0.03,0.09 0.18,0.11 0.24,0.36 1.4,0.49 1.94,0.58l0.19 -0.01 0.71 -0.01 0.08 -0.02 1.74 -0.17c0.25,0.04 0.03,-0.07 0.19,0.09l-2.62 4.74c-0.28,0.51 -0.56,1.2 -0.86,1.61 -0.44,-0.02 -0.69,-0.14 -1.18,-0.08 -0.38,0.04 -0.72,0.17 -1.08,0.22 0.1,-0.53 0.78,-1.5 -0.62,-1.96 -0.79,-0.26 -1.74,0.32 -2.33,0.6 -2.12,1.02 -2.81,3.28 -2.36,3.38 0.01,0.01 0.03,0.02 0.03,0.04l0.11 0.1c0.42,0.34 1.16,0.64 1.66,0.79 0.65,0.19 1.73,0.31 2.43,0.38 3,0.28 1.16,-2.8 1.09,-3.14 0.86,0.12 1.3,-0.05 1.81,0.56 -0.08,0.35 -0.53,1.2 -0.71,1.6 -0.74,1.61 -1.24,3.24 -1.73,4.96 -0.92,0.11 -1.11,0.44 -1.77,0.69 0.01,-1.08 0.1,-1.68 -1.14,-1.71 -0.55,-0.01 -0.8,0.17 -1.11,0.41 -1.43,1.08 -2.52,2.24 -2.53,4.15 -0,0.62 0.11,0.48 0.22,0.54 0.63,0.38 1.79,0.44 2.67,0.35 0.47,-0.05 0.97,-0.11 1.43,-0.2l0.98 -0.22c0.38,-0.08 0.14,-0.15 0.26,0.06 -0.08,0.78 -0.66,2.6 -0.56,3.29 -0.13,0.14 -0.07,0.08 -0.17,0.29 -0.06,0.13 -0.08,0.18 -0.12,0.33 -0.07,0.3 -0.02,0.6 -0.03,0.92 -0.09,0.94 -0.17,0.52 -0.78,0.94 -0.32,0.22 -0.57,0.55 -0.86,0.82 -0.29,-0.69 -0.22,-1.44 -1.39,-1.13 -0.93,0.25 -1.93,2.19 -2.03,3.16 -0.06,0.56 0.02,1.84 0.39,2.08 2,0.02 2.64,-0.6 4.08,-1.25l-0.01 0.28c-0.06,0.58 -0.22,2.09 -0.14,2.62 -0.44,0.37 -0.46,1.03 -0.12,1.49 -0.08,3.97 0.16,2.73 -0.77,3.57 -0.24,0.21 -0.37,0.4 -0.62,0.62 -0.36,-0.53 -0.09,-1.43 -1.37,-1.13 -0.98,0.23 -1.92,2.22 -2.06,3.14 -0.07,0.47 -0.07,1.79 0.41,2.09 0.86,0.04 1.94,-0.12 2.51,-0.52l0.16 -0.08c0.6,-0.17 1.39,-0.67 1.84,-0.94 0.12,0.18 0.04,0.07 0.14,0.1 -0.18,0.38 -0.31,0.07 -0.71,0.58 -0.67,0.86 0.33,1.72 0.89,2.31 0.6,0.64 1.71,1.63 2.94,1.88 0.38,-0.11 0.92,-1.2 1.04,-1.69 0.21,-0.86 0.15,-1.53 -0.05,-2.41 -0.22,-0.94 -0.24,-1.38 -1.01,-1.81 -0.93,-0.52 -1.19,0.28 -1.59,0.76 -0.21,-0.33 -0.33,-0.79 -0.58,-1.12 -0.48,-0.62 -0.48,-0.13 -0.5,-1.22 -0.02,-1.09 0.05,-2.25 0.01,-3.32 0.37,0.22 0.89,0.86 1.37,1.21 0.51,0.37 1.05,0.65 1.76,0.82 0.32,-0.02 0.92,-1.21 1.04,-1.68 0.22,-0.87 0.15,-1.53 -0.04,-2.41 -0.19,-0.86 -0.3,-1.41 -0.96,-1.79 -1.06,-0.6 -1.26,0.38 -1.71,0.74 -0.22,-0.8 -0.65,-1.34 -1.19,-1.71l0.5 -4.35 0.38 0.28c0.23,0.25 0.6,0.67 0.87,0.82 0.07,0.1 0.05,0.1 0.19,0.21 0.18,0.23 0.66,0.57 0.92,0.6 0.1,0.13 -0.01,0.03 0.16,0.16 0.08,0.06 0.1,0.07 0.18,0.11 0.14,0.07 0.26,0.1 0.44,0.15l0.45 0.17c0.35,0.08 0.75,-0.74 0.91,-1.05 0.21,-0.4 0.41,-1.07 0.43,-1.57 -0,-0.28 0.04,-0.67 -0.1,-0.85l0.03 -0.17c-0,-0.04 -0.01,-0.13 -0.01,-0.15 -0.05,-0.13 -0.03,-0.1 -0.09,-0.17 0.06,-0.51 -0.25,-1.75 -0.94,-2.22 -1.11,-0.74 -1.37,0.09 -1.86,0.69l-0.12 -0.2c-0.28,-0.56 -0.41,-1.06 -1,-1.45 0.04,-1.21 1.29,-5.03 1.31,-5.65 0.07,0.06 0.05,0.04 0.12,0.13 0.63,0.83 0.41,0.6 1.22,1.38 0.76,0.74 1.67,1.73 2.95,1.92 0.28,0.13 0.55,-0.41 0.69,-0.64 0.21,-0.34 0.36,-0.64 0.47,-1.02 0.36,-1.24 0.14,-3.92 -1.03,-4.6 -1.23,-0.72 -1.67,0.89 -1.75,0.72 -0.01,-0.01 -0.03,0.02 -0.04,0.03 -0.19,-0.33 -0.3,-0.68 -0.49,-1 -0.22,-0.38 -0.47,-0.51 -0.68,-0.79 0.39,-1.04 1.05,-2.29 1.59,-3.3 0.57,-1.06 1.2,-2.15 1.7,-3.17 1.43,-0.02 1.51,0.55 1.8,0.6 -0.1,0.19 -0.02,0.07 -0.16,0.2 -0.01,0.01 -0.21,0.13 -0.23,0.15 -0.8,0.47 -1.8,0.96 -1.37,2.09 0.14,0.37 0.42,0.53 0.75,0.73 1.23,0.73 2.46,1.53 4.32,1.53 0.28,-0.08 0.25,-0.15 0.35,-0.44 0.22,-0.63 0.33,-1.22 0.26,-1.93 -0.11,-1.05 -1.06,-3.33 -2.21,-3.65 -1.31,-0.37 -1.17,0.6 -1.56,1.21l-0.2 -0.19c-0.84,-0.96 -0.61,-0.56 -1.27,-1.09 0.16,-0.47 0.7,-1.32 0.98,-1.82 1.05,-1.91 1.94,-3.59 2.84,-5.61 0.73,0.01 1.23,0.31 1.57,0.68 -0.26,0.25 -1.37,0.7 -1.67,1.19 -0.51,0.8 -0.07,1.45 0.63,1.87 1.15,0.7 2.56,1.58 4.34,1.55 0.33,-0.09 0.46,-0.67 0.52,-0.98 0.28,-1.4 -0.01,-2.34 -0.66,-3.5 -0.49,-0.87 -0.67,-1.3 -1.44,-1.54 -1.15,-0.36 -1.27,0.44 -1.56,1.23 -0.65,-0.55 0.03,-0.23 -1.38,-1.25 0.22,-0.6 1.08,-2.59 1.06,-3.14 0.38,-0.35 0.52,-0.78 0.43,-1.4 0.22,-0.75 0.67,-4.16 0.53,-5 0.32,0.09 0.75,0.4 1.06,0.57 0.35,0.2 0.71,0.39 1.06,0.57 0.73,0.38 1.61,0.62 2.65,0.61 0.58,-0.21 0.64,-1.82 0.61,-2.32 -0.04,-0.79 -0.45,-1.64 -0.77,-2.19 -0.39,-0.68 -0.64,-1.3 -1.45,-1.52 -1.33,-0.36 -1.16,0.63 -1.55,1.24 -0.67,-0.66 -0.61,-0.87 -1.64,-1.37 -0.06,-2.55 -0.87,-5.97 -0.9,-6.74l0.15 -0.03 0.01 -0.03zm-14.34 62.71l-0.02 1.23c-0.17,-0.13 -0.38,-0.3 -0.62,-0.45 -0.2,-0.13 -0.4,-0.21 -0.59,-0.39 0.26,-0.28 0.65,-0.51 1.16,-0.55l0.07 0.15zm14.26 -66.46c-0.03,0.28 0.03,0.13 -0.15,0.29 -0.01,0.01 -0.24,0.12 -0.24,0.13 -0.22,0.12 -0.24,0.17 -0.54,0.21 0.01,-0.4 -0.17,-0.77 -0.25,-1.14 0.63,0.03 0.9,0.46 1.18,0.51zm-14.86 55.33c0.15,-0.05 0.34,-0.22 0.51,-0.31 0.29,-0.15 0.4,-0.14 0.78,-0.16 -0.03,0.41 -0.14,0.81 -0.08,1.19 -0.26,0.14 -0.08,0.13 -0.34,-0.03 -0.26,-0.16 -0.76,-0.47 -0.88,-0.69zm2.5 -3.73c0.16,-0.41 0.11,-0.97 0.32,-1.32 0.3,0.08 0.44,0.22 0.64,0.41 0.2,0.19 0.27,0.36 0.41,0.49 -0.16,0.21 0.06,0.08 -0.33,0.21 -0.1,0.03 -0.26,0.05 -0.36,0.08 -0.23,0.05 -0.43,0.12 -0.68,0.14zm0.14 8.74l-1.08 0.27c-0.09,-0.08 -0.07,0.14 -0.08,-0.17l0.07 -1.1c0.51,0.12 0.97,0.57 1.09,1.01zm-0.43 8.78c-0.17,0.02 -0.31,0.07 -0.44,0.1 -0.01,0 -0.23,0.03 -0.24,0.03 -0.22,-0.04 0,0.16 -0.14,-0.1l-0.01 -0.9c0.37,0.15 0.68,0.48 0.83,0.88zm7.48 -41.68c0.31,-0.02 0.51,-0.13 0.93,-0.12 0.35,0 0.54,0.09 0.82,0.17 -0.11,0.53 -0.59,0.91 -0.64,1.43 -0.25,-0.04 -0.12,0.01 -0.27,-0.15l-0.84 -1.31zm4.93 -8.23c-0.27,-0 -0.43,-0.17 -0.68,-0.32 -0.41,-0.23 -0.51,-0.16 -0.64,-0.47 0.15,-0.04 0.4,-0.31 0.62,-0.42 0.29,-0.15 0.49,-0.18 0.85,-0.23 0.05,0.51 -0.12,0.95 -0.14,1.43zm-12.94 26.21c0.63,-0.04 0.61,-0.21 1.47,-0.11l-0.33 1.55c-0.33,-0.14 -0.22,-0.21 -0.62,-0.71 -0.32,-0.39 -0.42,-0.39 -0.52,-0.74zm15.47 -33.38c-0.15,0.29 -0.36,0.33 -0.67,0.51 -0.26,0.15 -0.4,0.29 -0.69,0.42 -0.01,-0.23 0.02,-0.53 -0.08,-0.67l0.03 -0.86c0.33,0.01 0.6,0.1 0.83,0.21 0.22,0.11 0.42,0.34 0.58,0.38zm-12.41 30.37c0.14,-0.37 0.45,-1.36 0.68,-1.6 0.66,0.19 1.09,0.56 1.31,1.14 -0.34,0.04 -0.75,0.16 -1.08,0.25 -0.9,0.24 -0.77,0.49 -0.91,0.21z" />
  </svg>
);

const BreedLifeButton = () => (
    <Link
      to="/jarden"
      className="group relative inline-block px-11 py-3.5 bg-lime-400 text-lg font-medium text-slate-900 border border-lime-400 rounded-full animate-breathing-glow transition-shadow duration-500 ease-in-out hover:shadow-glow-hover smooth-transform"
      aria-label="Breed Life"
    >
      Breed Life
      <div className="icon-1 absolute top-0 right-0 w-[25px] origin-top-left drop-shadow-md animate-slay-1 transform rotate-10 text-green-800/80">
        <Icon1 />
      </div>
      <div className="icon-2 absolute top-0 left-[25px] w-[12px] origin-center-top drop-shadow-lg animate-slay-2 transform rotate-10 text-green-800/80">
        <Icon2 />
      </div>
      <div className="icon-3 absolute top-0 left-0 w-[18px] origin-center-top drop-shadow-lg animate-slay-3 transform -rotate-5 text-green-800/80">
        <Icon3 />
      </div>
    </Link>
);

const HangingVines = memo(() => (
  <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-40 overflow-hidden">
    <div className="absolute top-[-10px] left-[10%] w-[25px] text-lime-300/60 opacity-60 animate-slay-1 origin-top-left" style={{ animationDelay: '0s' }}>
      <Icon1 />
    </div>
    <div className="absolute top-[-5px] left-[30%] w-[18px] text-lime-300/50 opacity-50 animate-slay-3 origin-center-top" style={{ animationDelay: '1.5s', transform: 'scaleX(-1)' }}>
      <Icon3 />
    </div>
    <div className="absolute top-[-8px] left-[55%] w-[12px] text-lime-300/70 opacity-70 animate-slay-2 origin-center-top" style={{ animationDelay: '3s' }}>
      <Icon2 />
    </div>
    <div className="absolute top-[-12px] left-[75%] w-[25px] text-lime-300/50 opacity-50 animate-slay-1 origin-top-left" style={{ animationDelay: '0.8s', transform: 'scaleX(-1)' }}>
      <Icon1 />
    </div>
    <div className="absolute top-[-4px] left-[90%] w-[18px] text-lime-300/60 opacity-60 animate-slay-3 origin-center-top" style={{ animationDelay: '2.2s' }}>
      <Icon3 />
    </div>
  </div>
));


const LandingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(window.scrollY / totalHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroBackgroundStyle = {
    backgroundImage: `url(https://i.imgur.com/sKzQZEp.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="bg-[#02040a] font-sans text-white">
      <LandingHeader />
      <HangingVines />
      <TreeOfLifeSVG scrollProgress={scrollProgress} />
      
      <main className="relative z-20">
        <section className="min-h-screen flex flex-col items-center justify-center text-white overflow-hidden relative" style={heroBackgroundStyle}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-30 text-center px-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4" style={{textShadow: '0 4px 30px rgba(0,0,0,0.8)'}}>
              Empowering<br />Sustainable Living
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-12">
              Join our community of sustainability enthusiasts. Access knowledge, tools, and connect with like-minded individuals.
            </p>
            <BreedLifeButton />
          </div>
        </section>

        <section id="modules" className="py-24 px-4 relative bg-transparent">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-4xl font-bold text-center mb-12 text-white">Our Core Modules</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <ModuleCard icon={BookOpenIcon} title="Educa" description="Dive into a world of knowledge. Our Educa module offers articles, guides, and courses on all things sustainable." link="/educa" />
                    <ModuleCard icon={HomeModernIcon} title="Jarden" description="Your digital garden. Manage your plants, track progress, and get AI-powered tips with the Jarden module." link="/jarden" />
                </div>
            </div>
        </section>

        <section id="about" className="py-24 px-4 relative bg-transparent">
            <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                    <h2 className="text-4xl font-bold mb-6 text-white">About Senande.Life</h2>
                    <p className="text-white/80 mb-4">We are a collective of technologists, environmentalists, and dreamers who believe technology can be a powerful force for positive change. We are creating a digital ecosystem that provides the knowledge, tools, and connections needed to foster a greener future.</p>
                    <p className="text-white/80">Our platform is designed for sustainability enthusiasts from all walks of life—from curious beginners to seasoned experts. Join us on this journey to make a lasting impact, one conscious decision at a time.</p>
                </div>
                <div className="md:w-1/2 grid grid-cols-2 gap-4">
                    <img src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=800&q=80" alt="Lush green leaves" className="rounded-2xl shadow-lg w-full h-64 object-cover transform hover:scale-105 transition-all duration-300" />
                    <img src="https://images.unsplash.com/photo-1444858291040-5c7f763d9f1b?auto=format&fit=crop&w=800&q=80" alt="Person holding a small plant" className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8 transform hover:scale-105 transition-all duration-300" />
                </div>
            </div>
        </section>
      </main>
      
      <footer className="relative py-48 px-4 z-10 text-center overflow-hidden bg-[#0a0603]">
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#0a0603] via-transparent to-transparent"></div>
        <div className="container mx-auto text-lime-100/60 relative z-10">
            <p className="text-lg font-bold mb-2" style={{textShadow: '0 1px 10px rgba(173, 255, 47, 0.3)'}}>senande.life</p>
            <p className="text-sm">© {new Date().getFullYear()} - Cultivating a sustainable future, together.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;