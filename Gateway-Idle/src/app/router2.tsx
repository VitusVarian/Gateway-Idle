import { createBrowserRouter } from 'react-router-dom'
import { GamePage } from '../pages/GamePage2'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GamePage />,
  },
])
