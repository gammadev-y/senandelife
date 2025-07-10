
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Header Component (defined within Layout.tsx as requested)
// This component reflects the navigation structure from the provided image.
const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-6 md:p-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-widest text-white">SENANDE.LIFE</Link>
        
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

        <div className="md:hidden">
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

// Layout Component
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <Header />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {/* A footer can be added here later if needed */}
    </div>
  );
};

export default Layout;
