import './App.css';
import React from 'react';
import { Outlet, Link } from "react-router-dom";

// Components
import Auth from './Auth.js';

// These functions store/get the user object from local storage.
function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const userString = localStorage.getItem('user');
  if (userString != null) {
    return JSON.parse(userString);
  }
}

function App() {
  const user = getUser();
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light fixed-top mb-5">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Navbar</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className='nav-link active' to="/books">Book list</Link>
              </li>
              {
                user != null &&
                <li className="nav-item">
                  <Link className='nav-link' to="/preferences">Preferences</Link>
                </li>
              }
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
