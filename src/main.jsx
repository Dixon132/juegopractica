import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RoadScene } from './components/RoadScene.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoadScene />
  </StrictMode>,
)
