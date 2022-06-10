import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Components
import App from './App';
import Preferences from './Preferences';
import Books from './Books';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} >
        <Route path="books" element={<Books />} />
        <Route path="preferences" element={<Preferences />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
