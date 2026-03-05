import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { adminRoutes, authRoutes } from "./routes/routes";
import Authlayout from "./layout/Authlayout";
import Adminlayout from "./layout/Adminlayout";
import 'bootstrap/dist/css/bootstrap.min.css';

// Multi-layout function for React Router v6
const AppRoute = ({ component: Component, layout: Layout }) => (
  <Layout>
    <Component />
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        {authRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={<AppRoute component={route.component} layout={Authlayout} />}
          />
        ))}
        {adminRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={<AppRoute component={route.component} layout={Adminlayout} />}
          />
        ))}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
