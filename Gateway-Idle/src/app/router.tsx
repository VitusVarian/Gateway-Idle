import { createHashRouter } from 'react-router-dom'
import { GamePage } from '../pages/GamePage'

export const router = createHashRouter([
  {
    path: '/',
    element: <GamePage />,
  },
])
