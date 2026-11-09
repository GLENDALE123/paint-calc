import { describe, it, expect } from 'vitest'
import { mixAmounts, decompose, correction, ratioToPct, shares } from './calc.js'

const near = (a, b, d = 0.5) => expect(Math.abs(a - b)).toBeLessThan(d)

describe('mixAmounts', () => {
  it('외할: 주제 10kg + 무광 5% = 500g', () => {
    const r = mixAmounts({ baseG: 10000, basis: 'base', items: [{ id: 'm', type: 'matte', pct: 5 }] })
    near(r.rows[0].g, 500); near(r.totalG, 10500)
  })
  it('희석 모드: 안료는 (주제+신나) 기준 — 기존 앱과 동일', () => {
    const r = mixAmounts({ baseG: 5000, basis: 'baseThinner', items: [
      { id: 't', type: 'thinner', pct: 150 }, { id: 'y', type: 'pigment', pct: 2 }] })
    near(r.rows[0].g, 7500); near(r.rows[1].g, 250); near(r.totalG, 12750)
  })
})

describe('correction', () => {
  it('기존 기본배합 보정과 동일: 10kg, 무광 5% → 10%', () => {
    const r = correction({ totalG: 10000, basis: 'base',
      current: [{ id: 'm', type: 'matte', pct: 5 }], target: [{ id: 'm', type: 'matte', pct: 10 }] })
    near(r.base.addG, 0); near(r.rows[0].addG, 476.2, 0.1)
  })
  it('비율을 낮추면 주제를 더 넣는다: 5% → 2.5%', () => {
    const r = correction({ totalG: 10500, basis: 'base',
      current: [{ id: 'm', type: 'matte', pct: 5 }], target: [{ id: 'm', type: 'matte', pct: 2.5 }] })
    near(r.base.addG, 10000); near(r.rows[0].addG, 0)
  })
  it('시안 예시: 7.2kg, 희석 1:1.5, 황 3→4.5%, 적 1.3→1.2%', () => {
    const cur = [{ id: 't', type: 'thinner', pct: 150 }, { id: 'y', type: 'pigment', pct: 3 }, { id: 'r', type: 'pigment', pct: 1.3 }]
    const tgt = [{ id: 't', type: 'thinner', pct: 150 }, { id: 'y', type: 'pigment', pct: 4.5 }, { id: 'r', type: 'pigment', pct: 1.2 }]
    const r = correction({ totalG: 7200, basis: 'baseThinner', current: cur, target: tgt })
    near(r.base.curG, 2761.3); near(r.base.addG, 230.2)
    const by = Object.fromEntries(r.rows.map((x) => [x.id, x]))
    near(by.t.addG, 345.2, 1); near(by.y.addG, 129.4, 1); near(by.r.addG, 0)
    expect(by.r.stuck).toBe(false)
    near(r.finalG, 7904.9, 2)
  })
  it('목표에 없는 성분은 그대로 두고 stuck 표시', () => {
    const r = correction({ totalG: 10500, basis: 'base',
      current: [{ id: 'a', type: 'additive', pct: 5 }], target: [] })
    expect(r.rows[0].stuck).toBe(true); near(r.rows[0].addG, 0)
  })
  it('같은 배합이면 추가할 것이 없다', () => {
    const items = [{ id: 'm', type: 'matte', pct: 5 }]
    const r = correction({ totalG: 10500, basis: 'base', current: items, target: items })
    near(r.addTotalG, 0, 0.01)
  })
  it('decompose 합계는 총량과 같다', () => {
    const d = decompose({ totalG: 7200, basis: 'baseThinner', items: [{ id: 't', type: 'thinner', pct: 150 }, { id: 'y', type: 'pigment', pct: 3 }] })
    near(d.baseG + d.masses.t + d.masses.y, 7200, 0.01)
  })
})

describe('helpers', () => {
  it('ratioToPct 3:1, 1.5%', () => { const r = ratioToPct([3, 1], 1.5); near(r[0], 1.125, 1e-9); near(r[1], 0.375, 1e-9) })
  it('shares', () => {
    const s = shares(312, [14, 8, 4]); near(s.pct, 8.333, 0.01); expect(s.over).toBe(false)
    expect(shares(10, [8, 5]).over).toBe(true)
  })
})
