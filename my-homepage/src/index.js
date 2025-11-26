import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Handle GitHub Pages SPA redirect: if ?p=encodedPath is present, restore it
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encodedPath = params.get('p');
    if (encodedPath) {
      const target = decodeURIComponent(encodedPath);
      window.history.replaceState(null, '', target);
    }
  } catch {
    // no-op
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
