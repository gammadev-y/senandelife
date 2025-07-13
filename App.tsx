
import React, { Suspense} from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// --- IMPORTANT ---
// This AuthProvider should be the REAL one from your Jarden project,
// not the placeholder. Ensure you have moved the feature-rich AuthContext.tsx
// from Jarden into the main 'src/context/' folder.
import { AuthProvider } from './context/AuthContext';

// --- Shared Components & Pages ---
// These are part of the main application shell.
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';

// --- Lazy-loaded Modules ---
// This is the correct way to structure the lazy loading.
// Each module points to its own 'index.tsx' which acts as its entry point.
import EducaModule from './src/modules/educa/index';
import JardenModule from './src/modules/jarden/index';

// --- Loading Fallback Component ---
// A visually appealing loader to show while modules are being downloaded.
const FullscreenLoader: React.FC = () => (
    <div className="w-full h-screen flex items-center justify-center bg-[#0A1A10]">
        <div className="text-white text-xl font-light animate-pulse">Loading Module...</div>
    </div>
);

// Wrapper component to apply the shared Layout to a group of routes
const LayoutWrapper: React.FC = () => (
  <Layout>
    <Outlet />
  </Layout>
);


/**
 * This is the main application component for the entire senande.life platform.
 * Its primary responsibilities are:
 * 1. Setting up the global AuthProvider.
 * 2. Establishing the top-level MemoryRouter.
 * 3. Defining the main routes and lazy-loading the distinct modules.
 */
const App: React.FC = () => {
  return (
    // The single, global AuthProvider wraps the entire application,
    // ensuring consistent authentication state across all modules.
    <AuthProvider>
      <BrowserRouter>
        {/* Suspense is required to handle the "waiting" state of lazy-loaded modules */}
        <Suspense fallback={<FullscreenLoader />}>
          <Routes>
            {/* The Landing Page is now standalone to allow for its unique full-page design */}
            <Route path="/" element={<LandingPage />} />

            {/* Routes that use the shared Layout (e.g., main site pages) */}
            <Route element={<LayoutWrapper />}>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/educa/*" element={<EducaModule />} />
            </Route>

            {/* Jarden module route, which provides its own complete layout */}
            <Route path="/jarden/*" element={<JardenModule />} />

            {/* You will add future modules here, deciding if they use the shared Layout or not */}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;