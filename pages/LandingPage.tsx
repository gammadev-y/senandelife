import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon, Bars3Icon, BookOpenIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import backgroundImage from '../assets/bg-teal-waves-DrsXbGcO.png';


const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-50 text-white">
      <div className="container mx-auto flex justify-between items-center p-4 relative z-10" style={{ background: 'linear-gradient(to bottom, rgba(2, 4, 10, 0.7) 0%, rgba(2, 4, 10, 0) 100%)' }}>
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
          <div id="mobile-menu" className="fixed top-0 right-0 bottom-0 w-72 bg-[#0c140f] shadow-2xl z-40 animate-slide-in-right md:hidden">
            <div className="p-4 flex justify-end"><button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 rounded-md"><XMarkIcon className="h-6 w-6" /></button></div>
            <nav className="flex flex-col space-y-2 p-4">
              <Link to="/educa" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg">Educa</Link>
              <Link to="/jarden" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg">Jarden</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg">About</Link>
            </nav>
          </div>
        </>
      )}
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

const AnimatedBackground = memo(() => {
  const elements = Array.from({ length: 40 }).map((_, i) => {
    const isLeaf = i % 2 === 0;
    const animationDuration = 15 + Math.random() * 15;
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 30}s`,
      animationDuration: `${animationDuration}s`,
      transform: `scale(${0.5 + Math.random() * 0.5})`,
    };
    if (isLeaf) {
        style.animationName = 'fall-and-sway';
        return <div key={i} className="absolute text-lime-300/60" style={style}><svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M221.78,133.57C243.33,109,228.6,71.29,202,73.52c-13.33,1.12-24.89,10.33-31.14,21.11C152.17,67.88,110.64,32,66.18,32A52.11,52.11,0,0,0,14.24,84.12c-.1.2-.21.4-.31.6C-7.33,109.28,7.39,147,34,144.73c13.33-1.12,24.89-10.33,31.14-21.11,18.69,26.73,60.22,62.61,104.68,62.61A52.11,52.11,0,0,0,221.78,133.57Z"></path></svg></div>;
    } else {
        style.animationName = 'drift';
        return <div key={i} className="absolute rounded-full bg-cyan-300/70 w-1 h-1" style={style}></div>;
    }
  });
  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10 overflow-hidden">{elements}</div>;
});

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

// --- New Breed Life Button Components ---
const Shape1 = ({ className }: { className?: string }) => (
  <svg width="190" height="190" viewBox="0 0 380 380" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M338.584 189.998C364.427 238.164 344.902 281.771 295.066 295.061C281.771 344.902 238.164 364.422 189.998 338.584C141.831 364.427 98.2245 344.902 84.9337 295.066C35.0981 281.771 15.573 238.164 41.4157 189.998C15.573 141.831 35.0981 98.2245 84.9337 84.9337C98.2245 35.0981 141.831 15.573 189.998 41.4157C238.164 15.573 281.771 35.0981 295.061 84.9337C344.902 98.2245 364.422 141.831 338.584 189.998Z" />
  </svg>
);

const Shape2 = ({ className }: { className?: string }) => (
  <svg width="190" height="190" viewBox="0 0 381 380" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M63.0014 190C49.8954 174.339 42 154.126 42 132.06C42 82.321 82.1131 42 131.595 42C153.99 42 174.466 50.2594 190.173 63.9131C205.843 50.2594 226.271 42 248.614 42C297.981 42 338 82.321 338 132.06C338 154.126 330.123 174.339 317.048 190C330.123 205.661 338 225.874 338 247.94C338 297.679 297.981 338 248.614 338C226.271 338 205.843 329.741 190.173 316.087C174.466 329.741 153.99 338 131.595 338C82.1131 338 42 297.679 42 247.94C42 225.874 49.8954 205.661 63.0014 190Z" />
  </svg>
);

const BreedLifeButton = () => {
  return (
    <Link to="/jarden" className="relative inline-block group w-48 h-48" aria-label="Breed Life">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* This container holds the SVGs and has the glowing animation */}
        <div className="absolute inset-0 flex items-center justify-center text-lime-400/90 animate-breathing-glow transition-transform duration-300 ease-in-out group-hover:scale-105">
          <Shape1 
            className="absolute transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0" 
          />
          <Shape2 
            className="absolute transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100" 
          />
        </div>
        <span className="relative font-bold text-xl text-gray-900 dark:text-white 
                       transition-transform duration-300 ease-in-out 
                       group-hover:scale-110">
          Breed Life
        </span>
      </div>
    </Link>
  );
};

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
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="bg-[#02040a] font-sans text-white">
      <LandingHeader />
      <TreeOfLifeSVG scrollProgress={scrollProgress} />
      <AnimatedBackground />
      
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