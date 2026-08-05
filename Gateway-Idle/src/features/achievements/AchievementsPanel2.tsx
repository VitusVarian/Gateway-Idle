import { useGameStore } from '../../store/useGameStore'
import { ACHIEVEMENTS } from './achievements2'

export function AchievementsPanel() {
  const unlockedIds = useGameStore((state) => state.unlockedAchievementIds)

  return (
    <article className="rounded-2xl border border-stone-700/30 bg-stone-900/70 p-6 text-stone-200 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Achievements</p>
          <h2 className="mt-2 text-xl font-semibold">Milestone Rewards</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedIds.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              className={`rounded-xl border p-3 ${unlocked ? 'border-amber-400/50 bg-amber-400/10' : 'border-stone-700/40 bg-stone-950/70'}`}
            >
              <p className="text-sm font-medium text-stone-100">{achievement.title}</p>
              <p className="mt-1 text-xs text-stone-400">{achievement.description}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}
