import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Whitepaper } from './components/sections/Whitepaper';
import { Teams } from './components/sections/Teams';
import { FAQ } from './components/sections/FAQ';
import { JoinRevolution } from './components/sections/JoinRevolution';
import PrivacyPage from './pages/PrivacyPage';
import PolicyPage from './pages/PolicyPage';
import AIBlogPage from './pages/AIBlogPage';
import { UsersPage } from './pages/UsersPage';
import { trackPageView, trackUserEngagement } from './utils/analytics';
import './index.css';

// Add window.ethereum type declarations
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

// Component to track page views
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);

    // Track user engagement after page view
    const engagementTimer = setTimeout(() => {
      trackUserEngagement(3000); // User engaged for 3 seconds
    }, 3000);

    return () => clearTimeout(engagementTimer);
  }, [location]);

  return null;
}

// Component to handle auto-scrolling to sections based on route
function SectionScroller() {
  const location = useLocation();

  useEffect(() => {
    // Map routes to section IDs
    const routeToSectionMap: { [key: string]: string } = {
      '/about': 'about',
      '/whitepaper': 'whitepaper',
      '/pitch-deck': 'whitepaper',
      '/team': 'team',
      '/faq': 'faq',
      '/join': 'join-revolution'
    };

    const sectionId = routeToSectionMap[location.pathname];

    if (sectionId) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (location.pathname === '/') {
      // Scroll to top for home page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PageViewTracker />
        <SectionScroller />
        <div className="min-h-screen bg-brand-bg overflow-x-hidden">
          <Header />
          <main>
            <Routes>
              {/* Landing Page with Sections */}
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />

              {/* Section Routes - same content as home but with different URL */}
              <Route
                path="/about"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />
              <Route
                path="/whitepaper"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />
              <Route
                path="/pitch-deck"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />
              <Route
                path="/team"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />
              <Route
                path="/faq"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />
              <Route
                path="/join"
                element={
                  <>
                    <Hero />
                    <About />
                    <Whitepaper />
                    <Teams />
                    <FAQ />
                    <JoinRevolution />
                  </>
                }
              />

              {/* AI Blog Page */}
              <Route path="/ai-blog" element={<AIBlogPage />} />

              {/* Users Management Page (Admin Only) */}
              <Route path="/users" element={<UsersPage />} />

              {/* Separate Pages */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/policy" element={<PolicyPage />} />

              {/* Optional: 404 Page */}
              <Route path="*" element={<div className="text-center py-20 text-white">Page Not Found</div>} />
            </Routes>
          </main>
          <Footer />

          {/* Global Auth Modal */}
          <AuthModal />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
