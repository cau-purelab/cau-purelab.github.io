import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Research from './pages/Research';
import People from './pages/People';
import Publications from './pages/Publications';
import LabAssistant from './components/LabAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/research" element={<Research />} />
            <Route path="/people" element={<People />} />
            <Route path="/publications" element={<Publications />} />
          </Routes>
        </main>
        <LabAssistant />
        <Footer />
      </div>
    </Router>
  );
}

export default App;