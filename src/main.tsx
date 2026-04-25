import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Firebase Service Worker for Push Notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.error('Firebase Service Worker registration failed:', err);
    });
}
