import { createHashRouter } from 'react-router-dom'
import { GameShell } from './shell/GameShell'
import { BattlePanel } from '../features/battle/BattlePanel'
import { TrainingPanel } from '../features/training/TrainingPanel'
import { AchievementsPanel } from '../features/achievements/AchievementsPanel'
import { OptionsPanel } from '../features/options/OptionsPanel'
import { BottomPanelHost } from './shell/BottomPanelHost'

export const router = createHashRouter([
  {
    path: '/',
    element: <GameShell />,
    children: [
      {
        path: '/',
        element: <BottomPanelHost />,
        children: [
          { index: true, element: <BattlePanel /> },
          { path: 'battle', element: <BattlePanel /> },
          { path: 'training', element: <TrainingPanel /> },
          { path: 'achievements', element: <AchievementsPanel /> },
          { path: 'options', element: <OptionsPanel /> },
        ],
      },
    ],
  },
])
