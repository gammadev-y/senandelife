
import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';


// Header Component
// Updated with a functional mobile menu and static positioning to prevent layout shifts.
const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-[#0A1A10] z-20">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-xl font-bold tracking-widest text-white">SENANDE.LIFE</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <nav className="flex items-center space-x-6 lg:space-x-8 text-white/90">
              <Link to="/educa" className="text-sm hover:text-white transition-colors duration-300">Educa</Link>
              <Link to="/jarden" className="text-sm hover:text-white transition-colors duration-300">Jarden</Link>
              <Link to="/about" className="text-sm opacity-60 hover:opacity-100 hover:text-white transition-colors duration-300">About</Link>
            </nav>
            <button className="text-white/90 hover:text-white transition-colors duration-300" aria-label="Sign in">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel (Side Drawer) */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Panel */}
          <div
            id="mobile-menu"
            className="fixed top-0 right-0 bottom-0 w-72 bg-[#0c140f] shadow-2xl z-40 animate-slide-in-right md:hidden"
          >
            <div className="p-4 flex justify-end">
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white">
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2 p-4">
              <Link to="/educa" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg font-medium">Educa</Link>
              <Link to="/jarden" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg font-medium">Jarden</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white/90 hover:bg-white/10 block px-3 py-3 rounded-md text-lg font-medium">About</Link>
              <div className="border-t border-white/20 pt-4 mt-4">
                <button className="w-full flex items-center text-left text-white/90 hover:bg-white/10 px-3 py-3 rounded-md text-lg font-medium" aria-label="Sign in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Sign In
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

// Layout Component
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;