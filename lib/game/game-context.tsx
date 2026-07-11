'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  armorTiers,
  initialCharacter,
  initialCombat,
  initialOwnedToolIds,
  initialResources,
  initialSkillTree,
  monsters,
  skillNodes,
  tools,
  weaponTiers,
} from './mock-data'
import type {
  Character,
  CombatState,
  Resources,
  Settings,
  SkillTreeState,
} from './types'

interface GameState {
  character: Character
  resources: Resources
  combat: CombatState
  skillTree: SkillTreeState
  ownedToolIds: string[]
  weaponTier: number
  armorTier: number
  settings: Settings
  // actions
  setCharacter: (updater: (c: Character) => Character) => void
  selectMonsterLevel: (level: number) => void
  startFight: () => void
  tickCooldown: () => void
  mine: () => void
  buyTool: (toolId: string) => void
  upgradeWeapon: () => void
  upgradeArmor: () => void
  allocateSkill: (nodeId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
}

const GameContext = createContext<GameState | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [character, setCharacterState] = useState<Character>(initialCharacter)
  const [resources, setResources] = useState<Resources>(initialResources)
  const [combat, setCombat] = useState<CombatState>(initialCombat)
  const [skillTree, setSkillTree] = useState<SkillTreeState>(initialSkillTree)
  const [ownedToolIds, setOwnedToolIds] = useState<string[]>(initialOwnedToolIds)
  const [weaponTier, setWeaponTier] = useState(1)
  const [armorTier, setArmorTier] = useState(0)
  const [settings, setSettings] = useState<Settings>({
    reducedMotion: false,
    colorSafe: false,
    textScale: 'md',
  })

  // Apply accessibility settings to the document element.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('reduce-motion', settings.reducedMotion)
    root.classList.toggle('palette-color-safe', settings.colorSafe)
    const scaleMap = { sm: '15px', md: '16px', lg: '18px' }
    root.style.fontSize = scaleMap[settings.textScale]
    return () => {
      root.style.fontSize = ''
    }
  }, [settings])

  const setCharacter = useCallback(
    (updater: (c: Character) => Character) => setCharacterState(updater),
    [],
  )

  const selectMonsterLevel = useCallback((level: number) => {
    setCombat((c) => ({ ...c, selectedMonsterLevel: level }))
  }, [])

  const startFight = useCallback(() => {
    const monster =
      monsters.find((m) => m.level === combat.selectedMonsterLevel) ?? monsters[0]
    // Deterministic-ish mock resolution: win chance scales with character level.
    const win = character.level + weaponTier * 2 >= monster.level + 1
    if (win) {
      setCombat((c) => ({
        ...c,
        enemyHp: 0,
        enemyMaxHp: monster.maxHp,
        lastOutcome: 'victory',
        cooldownSecRemaining: 10,
      }))
      setResources((r) => ({ ...r, gold: r.gold + monster.goldReward }))
      setCharacterState((c) => {
        let xp = c.xp + monster.xpReward
        let level = c.level
        let xpRequired = c.xpRequired
        let skillPoints = c.skillPoints
        while (xp >= xpRequired) {
          xp -= xpRequired
          level += 1
          xpRequired = Math.round(xpRequired * 1.35)
          skillPoints += 1
        }
        return { ...c, xp, level, xpRequired, skillPoints }
      })
      if (win) {
        setSkillTree((s) => ({ ...s, availablePoints: s.availablePoints }))
      }
    } else {
      setCombat((c) => ({
        ...c,
        enemyHp: monster.maxHp,
        enemyMaxHp: monster.maxHp,
        playerHp: Math.max(0, c.playerHp - 40),
        lastOutcome: 'defeat',
        cooldownSecRemaining: 10,
      }))
    }
  }, [character.level, combat.selectedMonsterLevel, weaponTier])

  const tickCooldown = useCallback(() => {
    setCombat((c) =>
      c.cooldownSecRemaining > 0
        ? { ...c, cooldownSecRemaining: c.cooldownSecRemaining - 1 }
        : c,
    )
  }, [])

  // keep skillPoints synced between character and skill tree available points
  useEffect(() => {
    setSkillTree((s) => ({ ...s, availablePoints: character.skillPoints }))
  }, [character.skillPoints])

  const mine = useCallback(() => {
    const base = 55
    const gained = Math.round(base * resources.toolEffectMultiplier)
    setResources((r) => ({
      ...r,
      gold: r.gold + gained,
      totalMined: r.totalMined + gained,
    }))
  }, [resources.toolEffectMultiplier])

  const buyTool = useCallback(
    (toolId: string) => {
      const tool = tools.find((t) => t.toolId === toolId)
      if (!tool || ownedToolIds.includes(toolId) || resources.gold < tool.cost)
        return
      setResources((r) => ({
        ...r,
        gold: r.gold - tool.cost,
        toolEffectMultiplier: +(r.toolEffectMultiplier + tool.bonusPercent / 100).toFixed(
          2,
        ),
      }))
      setOwnedToolIds((ids) => [...ids, toolId])
    },
    [ownedToolIds, resources.gold],
  )

  const upgradeWeapon = useCallback(() => {
    const next = weaponTiers[weaponTier + 1]
    if (!next || resources.gold < next.cost) return
    setResources((r) => ({ ...r, gold: r.gold - next.cost }))
    setWeaponTier((t) => t + 1)
  }, [resources.gold, weaponTier])

  const upgradeArmor = useCallback(() => {
    const next = armorTiers[armorTier + 1]
    if (!next || resources.gold < next.cost) return
    setResources((r) => ({ ...r, gold: r.gold - next.cost }))
    setArmorTier((t) => t + 1)
  }, [armorTier, resources.gold])

  const allocateSkill = useCallback(
    (nodeId: string) => {
      const node = skillNodes.find((n) => n.nodeId === nodeId)
      if (!node) return
      if (skillTree.allocatedNodeIds.includes(nodeId)) return
      const connected =
        node.requires.length === 0 ||
        node.requires.some((r) => skillTree.allocatedNodeIds.includes(r))
      if (!connected || character.skillPoints < node.cost) return
      setSkillTree((s) => ({
        ...s,
        allocatedNodeIds: [...s.allocatedNodeIds, nodeId],
      }))
      setCharacterState((c) => ({ ...c, skillPoints: c.skillPoints - node.cost }))
    },
    [character.skillPoints, skillTree.allocatedNodeIds],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const value = useMemo<GameState>(
    () => ({
      character,
      resources,
      combat,
      skillTree,
      ownedToolIds,
      weaponTier,
      armorTier,
      settings,
      setCharacter,
      selectMonsterLevel,
      startFight,
      tickCooldown,
      mine,
      buyTool,
      upgradeWeapon,
      upgradeArmor,
      allocateSkill,
      updateSettings,
    }),
    [
      character,
      resources,
      combat,
      skillTree,
      ownedToolIds,
      weaponTier,
      armorTier,
      settings,
      setCharacter,
      selectMonsterLevel,
      startFight,
      tickCooldown,
      mine,
      buyTool,
      upgradeWeapon,
      upgradeArmor,
      allocateSkill,
      updateSettings,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
