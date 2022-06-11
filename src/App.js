import './App.css';
import React from 'react';
import { Outlet, Link } from "react-router-dom";

// Components
import Auth from './Auth.js';

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light fixed-top mb-5 container">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Navbar</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className='nav-link active' to="/books">Book list</Link>
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
    </div >
  );
}

export default App;
