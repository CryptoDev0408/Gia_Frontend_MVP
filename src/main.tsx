import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Web3ModalContext } from './contexts/Web3ModalContext.tsx'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3ModalContext>
      <App />
    </Web3ModalContext>
  </StrictMode>,
)
