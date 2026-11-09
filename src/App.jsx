import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from './store.jsx'
import { Icon } from './ui.jsx'
import { Home, Can, Result } from './screens/Work.jsx'
import { RecipeList, Build } from './screens/Recipes.jsx'
import { Defects } from './screens/Defects.jsx'

const ROOTS = { work: { name: 'home' }, recipes: { name: 'recipeList' }, defects: { name: 'defects' } }
const SCREENS = { home: Home, can: Can, result: Result, recipeList: RecipeList, build: Build, defects: Defects }

let seq = 0
const entry = (s) => ({ ...s, key: ++seq })

export default function App() {
  const { t } = useStore()
  const [tab, setTab] = useState('work')
  const [stacks, setStacks] = useState(() => Object.fromEntries(Object.entries(ROOTS).map(([k, v]) => [k, [entry(v)]])))
  const [dir, setDir] = useState(1)

  const nav = useMemo(() => ({
    push: (s) => { setDir(1); setStacks((st) => ({ ...st, [tab]: [...st[tab], entry(s)] })) },
    pop: () => { setDir(-1); setStacks((st) => ({ ...st, [tab]: st[tab].length > 1 ? st[tab].slice(0, -1) : st[tab] })) },
    reset: () => { setDir(-1); setStacks((st) => ({ ...st, [tab]: [st[tab][0]] })) },
    // 다른 탭으로 이동 (s 가 있으면 그 탭에서 s 를 연다). 떠나는 탭은 처음 화면으로 되돌린다.
    goTab: (k, s) => {
      setDir(1); setTab(k)
      setStacks((st) => {
        const next = { ...st, [tab]: [st[tab][0]] }
        if (s) next[k] = [st[k][0], entry(s)]
        return next
      })
    },
  }), [tab])

  const stack = stacks[tab]
  const { key: topKey, ...topProps } = stack[stack.length - 1]
  const top = { key: topKey, name: topProps.name }
  const Comp = SCREENS[top.name]
  const showTabs = stack.length === 1

  const tabs = [
    { k: 'work', label: t('tabWork'), icon: Icon.list },
    { k: 'recipes', label: t('tabRecipes'), icon: Icon.flask },
    { k: 'defects', label: t('tabDefects'), icon: Icon.pie },
  ]

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div key={tab + top.key} custom={dir} className="absolute inset-0"
          variants={{
            enter: (d) => ({ x: d > 0 ? '100%' : '-25%', opacity: d > 0 ? 1 : 0.6 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d > 0 ? '-25%' : '100%', opacity: d > 0 ? 0.6 : 1, zIndex: d > 0 ? 0 : 2 }),
          }}
          initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 420, damping: 42 }}>
          <Comp nav={nav} {...topProps} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showTabs && (
          <motion.nav initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            className="glass pb-safe-none absolute left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-[32px] p-1"
            style={{ bottom: 'max(env(safe-area-inset-bottom), 16px)' }} aria-label="Tabs">
            {tabs.map(({ k, label, icon: I }) => {
              const on = tab === k
              return (
                <button key={k} type="button" onClick={() => { setDir(0); setTab(k) }} aria-current={on ? 'page' : undefined}
                  className={`relative flex h-[54px] w-[96px] flex-col items-center justify-center gap-0.5 rounded-[27px] text-[10px] font-semibold ${on ? 'text-blue' : 'text-label'}`}>
                  {on && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-[27px] bg-fill" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <I className="relative" /><span className="relative max-w-[88px] truncate">{label}</span>
                </button>
              )
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
