import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* HashRouter is more reliable on GitHub Pages (no server rewrite needed) */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)

