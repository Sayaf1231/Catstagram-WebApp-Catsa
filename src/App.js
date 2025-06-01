import React from "react";
import './App.css';
import Home from './Pages/Home';
import SignIn from './Pages/SignIn';
import Feed from './Pages/Feed';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const user = localStorage.getItem("email");

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Always start on SignIn page */}
          <Route path="/" element={<Navigate to="/SignIn" />} />
          <Route path="/SignIn" element={<SignIn />} />

          {/* Ensure the user goes to Home or Feed based on login and profile status */}
          <Route path="/Home" element={user ? <Home /> : <Navigate to="/SignIn" />} />
          <Route path="/feed" element={user ? <Feed /> : <Navigate to="/SignIn" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
