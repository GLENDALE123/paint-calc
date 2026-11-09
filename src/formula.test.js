import { describe, it, expect } from 'vitest'
import { parse, serialize, expandName } from './formula.js'
import { mixAmounts } from './calc.js'

const near = (a, b, d = 0.5) => expect(Math.abs(a - b)).toBeLessThan(d)
const grams = (text, baseG) => {
  const { recipe, error } = parse(text)
  expect(error).toBeUndefined()
  const r = mixAmounts({ baseG, ...recipe })
  return Object.fromEntries(recipe.items.map((it, i) => [it.label, r.rows[i].g]))
}

describe('표기 해석', () => {
  it('한 줄 표기', () => {
    const g = grams('110무광 1 : (10000무광 1 : 02신나 1) 1 + 32000유광 10%', 10000)
    near(g['10000무광'], 5000); near(g['02신나'], 5000); near(g['32000유광'], 2000)
  })
  it('줄임말과 띄어쓰기 없음', () => {
    const g = grams('110무 1:(10000무 1:02신 1)1+32000유 10%', 10000)
    near(g['32000유광'], 2000)
    expect(parse('110무 1:(10000무 1:02신 1)1').recipe.baseLabel).toBe('110무광')
  })
  it('현장 메모 (줄 단위)', () => {
    const g = grams('110무광 - 1\n10000무 + 02신 - 1\n32000유광 - 10%', 10000)
    near(g['10000무광'], 5000); near(g['02신나'], 5000); near(g['32000유광'], 2000)
  })
  it('신나 비율 + 안료', () => {
    const { recipe } = parse('상도 1 : 02신 1.5 + 황색 4.5% + 적색 1.2%')
    const r = mixAmounts({ baseG: 10000, ...recipe })
    near(r.rows[0].g, 15000); near(r.rows[1].g, 1125); near(r.rows[2].g, 300)
    expect(recipe.items[0].type).toBe('thinner')
  })
  it('주제가 1이 아니면 나눠서 맞춘다', () => {
    const g = grams('A 2 : B 1', 1000)
    near(g.B, 500)
  })
  it('잘못된 표기는 error', () => {
    expect(parse('').error).toBeTruthy()
    expect(parse('110무 1 : (A 1').error).toBeTruthy()
    expect(parse('110무 1 + 유').error).toBeTruthy()
  })
  it('되돌리기 · 같은 이름은 id 유지', () => {
    const a = parse('110무 1 : (10000무 1 : 02신 1) 1 + 32000유 10%').recipe
    const text = serialize(a)
    expect(text).toBe('110무광 1 : (10000무광 1 : 02신나 1) 1 + 32000유광 10%')
    const b = parse(text.replace('10%', '15%'), a).recipe
    expect(b.items.map((x) => x.id)).toEqual(a.items.map((x) => x.id))
  })
  it('예전 "주제만 기준 %" 배합은 앞 재료 전체 기준으로 바꿔 쓴다', () => {
    const old = { baseLabel: '상도', basis: 'base', groups: [], items: [
      { id: 't', type: 'thinner', label: '신나', pct: 100 }, { id: 'p', type: 'pigment', label: '황', pct: 10 }] }
    expect(serialize(old)).toBe('상도 1 : 신나 1 + 황 5%')
  })
  it('expandName', () => { expect(expandName('02신')).toBe('02신나'); expect(expandName('황색')).toBe('황색') })
})
