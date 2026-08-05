import { createHashRouter } from 'react-router-dom'
import { GamePage } from '../pages/GamePage2'

export const router = createHashRouter([
  {
    path: '/',
    element: <GamePage />,
  },
])
