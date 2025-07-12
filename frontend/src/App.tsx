import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import Promotions from './pages/Promotions';
import Analytics from './pages/Analytics';
import Pickup from './pages/Pickup';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/pickup" element={<Pickup />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 