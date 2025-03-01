import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {CalendarProto2} from './CalendarProto2.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <CalendarProto2/>
  </StrictMode>,
)
