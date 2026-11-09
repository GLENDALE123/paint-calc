import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { detectLang, makeFmt, makeT } from './i18n.js'

// 서버 없이 이 기기(localStorage)에만 저장한다.
const KEY = 'paint-calc.v1'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

const empty = () => ({
  v: 1,
  lang: detectLang(),
  tareKg: '',
  canSeq: 0,
  recipes: [],
  cans: [],
  defects: { total: '', rows: [{ id: uid(), name: '', count: '' }] },
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    return { ...empty(), ...JSON.parse(raw) }
  } catch {
    return empty()
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* 저장 공간 없음: 화면은 계속 동작 */ }
    document.documentElement.lang = state.lang
  }, [state])

  useEffect(() => {
    // 홈 화면 앱에서 저장소가 지워지지 않도록 요청 (지원 브라우저만)
    try { navigator.storage?.persist?.() } catch { /* 무시 */ }
  }, [])

  const api = useMemo(() => {
    const set = (fn) => setState((s) => ({ ...s, ...fn(s) }))
    return {
      setLang: (lang) => set(() => ({ lang })),
      setTare: (tareKg) => set(() => ({ tareKg })),
      saveRecipe: (r) => set((s) => ({
        recipes: s.recipes.some((x) => x.id === r.id) ? s.recipes.map((x) => (x.id === r.id ? r : x)) : [...s.recipes, r],
      })),
      deleteRecipe: (id) => set((s) => ({ recipes: s.recipes.filter((x) => x.id !== id) })),
      addCan: (can) => {
        const id = uid()
        set((s) => ({
          canSeq: s.canSeq + 1,
          cans: [{ ...can, id, no: s.canSeq + 1, createdAt: Date.now(), updatedAt: Date.now() }, ...s.cans],
        }))
        return id
      },
      updateCan: (id, patch) => set((s) => ({
        cans: s.cans.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
      })),
      deleteCan: (id) => set((s) => ({ cans: s.cans.filter((c) => c.id !== id) })),
      setDefects: (defects) => set(() => ({ defects })),
      importRecipes: (list) => {
        const clean = list.filter((r) => r && typeof r === 'object' && Array.isArray(r.items)).map(sanitizeRecipe)
        set((s) => {
          const map = new Map(s.recipes.map((r) => [r.id, r]))
          for (const r of clean) map.set(r.id, r)
          return { recipes: [...map.values()] }
        })
        return clean.length
      },
    }
  }, [])

  const t = useMemo(() => makeT(state.lang), [state.lang])
  const fmt = useMemo(() => makeFmt(state.lang), [state.lang])

  return <Ctx.Provider value={{ state, ...api, t, fmt }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)

const TYPES = ['thinner', 'pigment', 'gloss', 'matte', 'additive', 'other']
export const MATERIAL_TYPES = TYPES
export const BASE_TYPES = ['base', 'gloss', 'matte']
export const COLORS = ['#8E8E93', '#3A3A3C', '#E5E5EA', '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#8A4B32', '#AF52DE', '#FFCC00']

function sanitizeRecipe(r) {
  const num = (x) => (Number.isFinite(+x) ? +x : 0)
  return {
    id: String(r.id || uid()),
    name: String(r.name || '').slice(0, 60),
    color: COLORS.includes(r.color) ? r.color : COLORS[0],
    baseType: BASE_TYPES.includes(r.baseType) ? r.baseType : 'base',
    baseLabel: String(r.baseLabel || '').slice(0, 40),
    basis: r.basis === 'baseThinner' ? 'baseThinner' : 'base',
    groups: (Array.isArray(r.groups) ? r.groups : []).slice(0, 10).map((g) => ({ id: String(g.id || uid()), ratio: num(g.ratio) })),
    items: r.items.slice(0, 30).map((it) => ({
      id: String(it.id || uid()),
      type: TYPES.includes(it.type) ? it.type : 'other',
      label: String(it.label || '').slice(0, 40),
      pct: num(it.pct),
      ...(it.mode === 'ratio' || it.mode === 'pct' ? { mode: it.mode } : {}),
      ...(it.group ? { group: String(it.group), part: num(it.part) } : {}),
    })),
  }
}

export function exportPayload(recipes) {
  return JSON.stringify({ app: 'paint-calc', v: 1, exportedAt: new Date().toISOString(), recipes }, null, 2)
}

export function parseImport(text) {
  const data = JSON.parse(text)
  const list = Array.isArray(data) ? data : data?.recipes
  if (!Array.isArray(list)) throw new Error('bad file')
  return list
}

export const parseNum = (s) => {
  const n = parseFloat(String(s ?? '').replace(',', '.').replace(/\s/g, ''))
  return Number.isFinite(n) ? n : NaN
}

/** 재료 표시 이름 */
export const matName = (it, t) => it.label?.trim() || t('type.' + it.type)
