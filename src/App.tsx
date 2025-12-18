import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
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

            {/* AI Blog Page */}
            <Route path="/ai-blog" element={<AIBlogPage />} />

            {/* Separate Pages */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/policy" element={<PolicyPage />} />

            {/* Optional: 404 Page */}
            <Route path="*" element={<div className="text-center py-20 text-white">Page Not Found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
