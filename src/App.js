import './App.css';
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from "react-router-dom";
import {
  getAuth, onAuthStateChanged
} from "firebase/auth"

// Components
import Auth from './Auth.js';

import { AuthProvider } from './AuthContext';

const auth = getAuth();

function App() {

  const [user, setUser] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []); // Subscribe to auth change on render only.

  return (
    <AuthProvider value={{ user: user }}>
      <nav className="navbar navbar-expand-lg bg-light fixed-top mb-5 container">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Navbar</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className='nav-link' to="/books">Book list</Link>
              </li>
              <li className="nav-item">
                <Link className='nav-link' to="/preferences">Preferences</Link>
              </li>
            </ul>
            <div className='ms-auto'>
              <Auth />
            </div>
          </div>
        </div>
      </nav>
      <div className='container'>
        <Outlet />
      </div>
    </AuthProvider>
  );
}

export default App;
