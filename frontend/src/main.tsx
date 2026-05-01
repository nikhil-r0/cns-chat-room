import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.onerror = function(msg, url, line, col, error) {
  const div = document.createElement('div');
  div.style.color = 'red';
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '9999';
  div.style.background = 'white';
  div.style.padding = '10px';
  div.innerText = 'Runtime Error: ' + msg;
  document.body.appendChild(div);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
