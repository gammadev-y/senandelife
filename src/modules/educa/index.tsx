
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Placeholder Component for the Educa module's home page
const EducaHomePage: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white p-8 bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="text-center">
        <div className="mb-4 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
        </div>
        <h1 className="text-5xl font-bold text-green-400 mb-2">Educa Module</h1>
        <p className="text-xl text-gray-300 mb-8">
          Welcome to the center for sustainable knowledge and learning.
        </p>
        <Link 
          to="/" 
          className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};


// Router for the 'educa' module
const EducaModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<EducaHomePage />} />
      {/* Additional routes for the educa module, e.g., /courses, /articles */}
    </Routes>
  );
};

export default EducaModule;
