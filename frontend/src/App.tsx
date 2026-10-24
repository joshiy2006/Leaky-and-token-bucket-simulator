// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TokenBucketSimulator from "./pages/TokenBucketSimulator";
import LeakyBucketSimulator from "./pages/LeakyBucketSimulator";
import ExperimentHistory from "./pages/ExperimentHistory";
import LearningCenter from "./pages/LearningCenter";
import Overview from "./pages/Overview";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <nav className="bg-primary-500 p-4 flex space-x-4 text-white">
          <Link to="/" className="font-semibold">Overview</Link>
          <Link to="/token" className="font-semibold">Token Bucket</Link>
          <Link to="/leaky" className="font-semibold">Leaky Bucket</Link>
          <Link to="/history" className="font-semibold">History</Link>
          <Link to="/learn" className="font-semibold">Learning</Link>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/token" element={<TokenBucketSimulator />} />
            <Route path="/leaky" element={<LeakyBucketSimulator />} />
            <Route path="/history" element={<ExperimentHistory />} />
            <Route path="/learn" element={<LearningCenter />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
