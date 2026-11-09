// 배합 표시/편집 헬퍼 (화면 공용)
import { kindOf } from './calc.js'
import { matName, parseNum } from './store.jsx'

export const baseName = (r, t) => r.baseLabel?.trim() || t('type.' + (r.baseType || 'base'))

/** 편집 칸에 보여줄 값: 묶음 안 → 몫, ratio → x, pct → % */
export const editVal = (it) => {
  const k = kindOf(it)
  const v = k === 'group' ? it.part : k === 'ratio' ? it.pct / 100 : it.pct
  return String(+(+v || 0).toFixed(4))
}

/** 편집 값 → 저장 필드 */
export const fromVal = (it, val) => {
  const v = parseNum(val) || 0
  const k = kindOf(it)
  return k === 'group' ? { part: v } : { pct: k === 'ratio' ? v * 100 : v }
}

/** 이 배합에 1 : x 로 들어가는 재료(또는 미리 섞기 묶음)가 있는지 */
export const hasFixed = (r) => r.items.some((it) => kindOf(it) !== 'pct')

export function itemDetail(it, r, t, fmt) {
  const base = baseName(r, t)
  const k = kindOf(it)
  if (k === 'group') {
    const g = (r.groups || []).find((x) => x.id === it.group)
    return t('partOf', { p: fmt.num(+it.part || 0, 2), base, r: fmt.num(+g?.ratio || 0, 2) })
  }
  if (k === 'ratio') return t('ratioOf', { base, r: fmt.num(it.pct / 100, 2) })
  const p = fmt.num(it.pct, 3)
  return r.basis === 'baseThinner' && hasFixed(r) ? t('pctOfMix', { base, p }) : t('pctOfBase', { base, p })
}

/** 현장 표기: 110무광 1 : (10000무광 1 : 02신나 1) 1 + 32000유광 10% */
export function formula(r, t, fmt) {
  const n = (x) => fmt.num(+x || 0, 3)
  const parts = [`${baseName(r, t)} 1`]
  for (const it of r.items) if (kindOf(it) === 'ratio') parts.push(`${matName(it, t)} ${n(it.pct / 100)}`)
  for (const g of r.groups || []) {
    const m = r.items.filter((it) => it.group === g.id)
    if (m.length) parts.push(`(${m.map((it) => `${matName(it, t)} ${n(it.part)}`).join(' : ')}) ${n(g.ratio)}`)
  }
  let s = parts.join(' : ')
  for (const it of r.items) if (kindOf(it) === 'pct') s += ` + ${matName(it, t)} ${n(it.pct)}%`
  return s
}

/** 실제 질량 그대로(주제 1 : x) 고정한 재료 목록 — 보정 후 덜어낼 수 없는 성분이 있을 때 통 기록용 */
export function flatten(items, rows, B) {
  return items.map(({ group, part, ...x }) => {
    const row = rows.find((r) => r.id === x.id)
    return { ...x, mode: 'ratio', pct: B > 0 && row ? (row.finalG / B) * 100 : 0 }
  })
}
