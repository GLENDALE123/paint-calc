// 도료 배합 계산 (모든 질량은 g)
//
// 배합 모델 — 모든 재료는 주제 무게 B 에 대한 계수 c 로 바뀐다 (재료 질량 = B × c)
//   - 'ratio' 재료 : 주제 1 : x            → c = x        (신나는 기본이 ratio, pct 에 x×100 저장)
//   - 미리 섞기 묶음: 주제 1 : (A a : B b) r → 묶음 안 재료 c = r × 몫/몫합
//   - 'pct' 재료   : 기준 질량 대비 p%     → c = f × p/100
//       basis = 'base'        → f = 1
//       basis = 'baseThinner' → f = 1 + (ratio 재료와 묶음 계수 합)  = '앞 재료 전체'
//
//   총 질량 = B × (1 + Σc)

export const isThinner = (item) => item.type === 'thinner'

/** 재료 입력 방식: 'group'(미리 섞기 안) | 'ratio'(1 : x) | 'pct'(%) */
export const kindOf = (it) => (it.group ? 'group' : it.mode === 'ratio' || it.mode === 'pct' ? it.mode : isThinner(it) ? 'ratio' : 'pct')

const pos = (x) => (Number.isFinite(+x) && +x > 0 ? +x : 0)
const frac = (pct) => pos(pct) / 100

/** 배합 {basis, groups, items} → { [id]: 계수 } */
export function coefs({ basis, groups = [], items }) {
  const c = {}
  let fixed = 0
  const gs = new Map(groups.map((g) => [g.id, g]))
  for (const g of groups) {
    const members = items.filter((it) => it.group === g.id)
    const sum = members.reduce((a, it) => a + pos(it.part), 0)
    for (const it of members) c[it.id] = sum ? (pos(g.ratio) * pos(it.part)) / sum : 0
    if (sum) fixed += pos(g.ratio)
  }
  for (const it of items) {
    const k = kindOf(it)
    if (k === 'group') { if (!gs.has(it.group)) c[it.id] = 0; continue }
    if (k === 'ratio') { c[it.id] = frac(it.pct); fixed += c[it.id] }
  }
  const f = basis === 'baseThinner' ? 1 + fixed : 1
  for (const it of items) if (kindOf(it) === 'pct') c[it.id] = f * frac(it.pct)
  return c
}

/** 새로 섞기: 주제 무게(g)로 각 재료 투입량 계산 */
export function mixAmounts({ baseG, ...recipe }) {
  const c = coefs(recipe)
  const rows = recipe.items.map((it) => ({ id: it.id, g: baseG * c[it.id] }))
  return { rows, totalG: baseG + rows.reduce((a, r) => a + r.g, 0) }
}

/** 남은 총량(g)과 현재 배합으로 각 성분 질량 추정 */
export function decompose({ totalG, ...recipe }) {
  const c = coefs(recipe)
  const B = totalG / (1 + Object.values(c).reduce((a, x) => a + x, 0))
  const masses = {}
  for (const it of recipe.items) masses[it.id] = B * c[it.id]
  return { baseG: B, masses }
}

/**
 * 보정: 이미 섞은 통을 목표 배합에 맞추려면 무엇을 얼마나 더 넣는지.
 * 덜어낼 수는 없으므로, 목표보다 많은 성분이 있으면 나머지를 늘려서 맞춘다.
 * current / target 은 {basis, groups, items} (같은 id 체계, target 에 없으면 목표 0).
 */
export function correction({ totalG, current, target }) {
  const cur = decompose({ totalG, ...current })
  const cT = coefs(target)
  let B2 = cur.baseG
  for (const it of target.items) {
    const m = cur.masses[it.id] || 0
    if (cT[it.id] > 0 && m > 0) B2 = Math.max(B2, m / cT[it.id])
  }
  const ids = [...new Set([...current.items.map((i) => i.id), ...target.items.map((i) => i.id)])]
  const rows = []
  let finalG = B2
  for (const id of ids) {
    const curG = cur.masses[id] || 0
    const want = B2 * (cT[id] || 0)
    const finalItemG = Math.max(curG, want)
    finalG += finalItemG
    rows.push({ id, curG, finalG: finalItemG, addG: finalItemG - curG, stuck: curG > want + 0.05 })
  }
  return { base: { curG: cur.baseG, finalG: B2, addG: B2 - cur.baseG }, rows, finalG, addTotalG: finalG - totalG }
}

/** 비율(3:1)과 총 함유량(%)을 각 재료의 % 로 변환 */
export function ratioToPct(parts, totalPct) {
  const sum = parts.reduce((a, p) => a + (p > 0 ? p : 0), 0)
  if (!sum) return parts.map(() => 0)
  return parts.map((p) => (p > 0 ? (totalPct * p) / sum : 0))
}

/** 차지율 */
export function shares(total, counts) {
  const sum = counts.reduce((a, c) => a + (c > 0 ? c : 0), 0)
  return {
    rows: counts.map((c) => (total > 0 ? (c / total) * 100 : 0)),
    sum,
    pct: total > 0 ? (sum / total) * 100 : 0,
    over: sum > total,
  }
}
