// 도료 배합 계산 (모든 질량은 g)
//
// 배합 모델
//   - 주제(기준 재료) 무게 B
//   - 신나: 주제 대비 비율 t  (예: 1 : 1.5 → t = 1.5, 화면에서는 150% 로 저장)
//   - 그 외 재료 i: 기준 질량 대비 p_i (외할, %)
//       basis = 'base'        → 기준 질량 = B
//       basis = 'baseThinner' → 기준 질량 = B × (1 + t)   (기존 앱의 '희석' 모드)
//
//   총 질량 = B(1 + t) + B·f·Σp,   f = basis === 'baseThinner' ? 1 + t : 1

export const isThinner = (item) => item.type === 'thinner'

const frac = (pct) => (Number.isFinite(pct) && pct > 0 ? pct / 100 : 0)

function split(items) {
  let t = 0
  const others = []
  for (const it of items) {
    if (isThinner(it)) t += frac(it.pct)
    else others.push(it)
  }
  return { t, others }
}

const factor = (basis, t) => (basis === 'baseThinner' ? 1 + t : 1)

/** 새로 섞기: 주제 무게(g)로 각 재료 투입량 계산 */
export function mixAmounts({ baseG, basis, items }) {
  const { t } = split(items)
  const f = factor(basis, t)
  const rows = items.map((it) => ({
    id: it.id,
    g: isThinner(it) ? baseG * frac(it.pct) : baseG * f * frac(it.pct),
  }))
  const totalG = baseG + rows.reduce((a, r) => a + r.g, 0)
  return { rows, totalG }
}

/** 남은 총량(g)과 현재 배합으로 각 성분 질량 추정 */
export function decompose({ totalG, basis, items }) {
  const { t, others } = split(items)
  const f = factor(basis, t)
  const sumP = others.reduce((a, it) => a + frac(it.pct), 0)
  const B = totalG / (1 + t + f * sumP)
  const masses = {}
  for (const it of items) masses[it.id] = isThinner(it) ? B * frac(it.pct) : B * f * frac(it.pct)
  return { baseG: B, masses }
}

/**
 * 보정: 이미 섞은 통을 목표 배합에 맞추려면 무엇을 얼마나 더 넣는지.
 * 덜어낼 수는 없으므로, 목표보다 많은 성분이 있으면 나머지를 늘려서 맞춘다.
 * current / target 의 items 는 같은 id 체계를 쓴다 (target 에 없으면 목표 0%).
 */
export function correction({ totalG, basis, current, target }) {
  const cur = decompose({ totalG, basis, items: current })
  const { t: tT, others: tOthers } = split(target)
  const fT = factor(basis, tT)
  const curThinnerG = current.filter(isThinner).reduce((a, it) => a + cur.masses[it.id], 0)

  let B2 = cur.baseG
  if (tT > 0 && curThinnerG > 0) B2 = Math.max(B2, curThinnerG / tT)
  for (const it of tOthers) {
    const p = frac(it.pct)
    const m = cur.masses[it.id] || 0
    if (p > 0 && m > 0) B2 = Math.max(B2, m / (fT * p))
  }

  const ids = new Set([...current.map((i) => i.id), ...target.map((i) => i.id)])
  const rows = []
  let finalG = B2
  for (const id of ids) {
    const tgt = target.find((i) => i.id === id)
    const curG = cur.masses[id] || 0
    let want = 0
    if (tgt) want = isThinner(tgt) ? B2 * frac(tgt.pct) : B2 * fT * frac(tgt.pct)
    const finalItemG = Math.max(curG, want)
    finalG += finalItemG
    rows.push({ id, curG, finalG: finalItemG, addG: finalItemG - curG, stuck: curG > want + 0.05 })
  }
  return {
    base: { curG: cur.baseG, finalG: B2, addG: B2 - cur.baseG },
    rows,
    finalG,
    addTotalG: finalG - totalG,
  }
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
