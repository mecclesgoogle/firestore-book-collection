import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Components
import App from './App';
import Preferences from './Preferences';
import Books from './Books';

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const userString = localStorage.getItem('user');
  const user = JSON.parse(userString);
  return user;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} >
        <Route path="books" element={<Books setUser={setUser} getUser={getUser} />} />
        <Route path="preferences" element={<Preferences getUser={getUser} />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
