import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { selectTrainingNavigationVisibility } from '../../store/selectors/gameSelectors'
import { useUiStore, type PanelKey } from '../../store/uiStore'

const BOTTOM_NAV_ITEMS = [
  { to: '/battle', label: 'Battle' },
  { to: '/training', label: 'Training' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/options', label: 'Options' },
] as const

export function BottomPanelHost() {
  const location = useLocation()
  const trainingUnlocked = useGameStore((state) => state.trainingUnlocked)
  const maxUnlockedStage = useGameStore((state) => state.maxUnlockedStage)
  const trainingResetCount = useGameStore((state) => state.trainingResetCount)
  const activePanel = useUiStore((state) => state.activePanel)
  const setActivePanel = useUiStore((state) => state.setActivePanel)

  useEffect(() => {
    const nextPanel: PanelKey =
      location.pathname === '/training'
        ? 'training'
        : location.pathname === '/achievements'
          ? 'achievements'
          : location.pathname === '/options'
            ? 'options'
            : 'battle'

    if (nextPanel !== activePanel) {
      setActivePanel(nextPanel)
    }
  }, [activePanel, location.pathname, setActivePanel])

  const trainingNavigation = useMemo(
    () => selectTrainingNavigationVisibility(useGameStore.getState()),
    [maxUnlockedStage, trainingResetCount, trainingUnlocked],
  )

  const visibleItems = BOTTOM_NAV_ITEMS.filter((item) => {
    if (item.to === '/training') {
      return trainingNavigation.visible
    }

    return true
  })

  return (
    <div className="flex h-full flex-col gap-3">
      <nav aria-label="Bottom panel navigation" className="flex flex-wrap gap-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => {
              const nextPanel: PanelKey =
                item.to === '/training'
                  ? 'training'
                  : item.to === '/achievements'
                    ? 'achievements'
                    : item.to === '/options'
                      ? 'options'
                      : 'battle'

              setActivePanel(nextPanel)
            }}
            className={({ isActive }) =>
              `rounded-full border px-3 py-1.5 text-sm transition ${isActive ? 'border-amber-400/70 bg-amber-400/15 text-amber-200' : 'border-stone-700 bg-stone-950/70 text-stone-300 hover:border-stone-500'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="min-h-[14rem] flex-1 rounded-2xl border border-stone-800/70 bg-stone-950/60 p-3">
        <p className="mb-3 text-sm text-stone-400">Location: {location.pathname}</p>
        <Outlet />
      </div>
    </div>
  )
}
