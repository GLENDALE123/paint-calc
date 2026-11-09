// 현장 표기 ↔ 배합
//
//   110무광 1 : (10000무광 1 : 02신나 1) 1 + 32000유광 10%
//   ─ 주제 ─   ─────── 미리 섞기 (주제 1 : 묶음 r) ───────   ─ 앞 재료 전체 대비 % ─
//
// 줄 단위 메모도 읽는다:
//   110무광 - 1
//   10000무 + 02신 - 1        (+ 로 이은 줄 = 같은 몫으로 미리 섞기)
//   32000유광 - 10%
import { kindOf, coefs } from './calc.js'

const uid = () => Math.random().toString(36).slice(2, 10)

/** 줄임말: 110무 → 110무광, 32000유 → 32000유광, 02신 → 02신나 */
export function expandName(s) {
  const n = String(s || '').trim()
  if (/무$/.test(n)) return n + '광'
  if (/유$/.test(n)) return n + '광'
  if (/신$/.test(n)) return n + '나'
  return n
}
/** 줄임말로 줄이기 (버튼 표시용) */
export const shortName = (s) => String(s || '').replace(/무광$/, '무').replace(/유광$/, '유').replace(/신나$/, '신')

export function typeOf(name) {
  if (/무광$/.test(name)) return 'matte'
  if (/유광$/.test(name)) return 'gloss'
  if (/신나$|thinner$/i.test(name)) return 'thinner'
  return 'pigment'
}

const isNum = (w) => /^\d+(?:[.,]\d+)?$/.test(w)
const toNum = (w) => parseFloat(String(w).replace(',', '.'))

/** 여러 줄 메모 → 한 줄 표기 */
function fromLines(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return text
  return lines.map((line, i) => {
    const m = line.match(/^(.*?)[\s]*[-–—=]\s*([\d.,]+)\s*(%?)\s*$/)
    const name = m ? m[1].trim() : line
    const val = m ? m[2] : '1'
    const pct = m ? m[3] === '%' : false
    if (i === 0) return `${name} ${val}`
    if (pct) return `+ ${name} ${val}%`
    if (name.includes('+')) return `: (${name.split('+').map((p) => p.trim() + ' 1').join(' : ')}) ${val}`
    return `: ${name} ${val}`
  }).join(' ')
}

export function tokenize(text) {
  const src = fromLines(String(text || ''))
    .replace(/[：]/g, ':').replace(/[（]/g, '(').replace(/[）]/g, ')').replace(/[＋]/g, '+').replace(/[％]/g, '%')
  return src.match(/\(|\)|:|\+|%|[^\s():+%]+/g) || []
}

/**
 * 표기 → { recipe, lines, error }
 * prev: 고치는 중인 배합 (같은 이름 재료의 id 를 이어 쓴다)
 */
export function parse(text, prev) {
  const toks = tokenize(text)
  let i = 0
  const peek = () => toks[i]
  const next = () => toks[i++]
  const used = new Set()
  const idFor = (label, group) => {
    const hit = prev?.items?.find((it) => !used.has(it.id) && (it.label || '') === label && !!it.group === !!group)
    const id = hit ? hit.id : uid()
    used.add(id)
    return id
  }
  const groupId = (n) => prev?.groups?.[n]?.id || uid()

  const err = (msg) => ({ error: msg, at: i })
  if (!toks.length) return { error: 'empty' }

  const baseTok = next()
  if (isNum(baseTok) || /[():+%]/.test(baseTok)) return err('base')
  const baseLabel = expandName(baseTok)
  let b = 1
  if (isNum(peek())) b = toNum(next()) || 1

  const groups = []
  const items = []
  const num = () => (isNum(peek()) ? toNum(next()) : null)

  while (i < toks.length) {
    const op = next()
    if (op === ':') {
      if (peek() === '(') {
        next()
        const gid = groupId(groups.length)
        const members = []
        while (i < toks.length && peek() !== ')') {
          if (peek() === ':') { next(); continue }
          const name = next()
          if (isNum(name) || /[(+%]/.test(name)) return err('group')
          const label = expandName(name)
          members.push({ id: idFor(label, true), type: typeOf(label), label, group: gid, part: num() ?? 1, pct: 0 })
        }
        if (peek() !== ')') return err('paren')
        next()
        const r = num() ?? 1
        if (!members.length) return err('group')
        groups.push({ id: gid, ratio: r / b })
        items.push(...members)
      } else {
        const name = next()
        if (!name || isNum(name) || /[():+%]/.test(name)) return err('name')
        const label = expandName(name)
        const x = num()
        if (x == null) return err('num')
        items.push({ id: idFor(label, false), type: typeOf(label), label, mode: 'ratio', pct: (x / b) * 100 })
      }
    } else if (op === '+') {
      const name = next()
      if (!name || isNum(name) || /[():+%]/.test(name)) return err('name')
      const label = expandName(name)
      const p = num()
      if (p == null) return err('num')
      if (peek() === '%') next()
      items.push({ id: idFor(label, false), type: typeOf(label), label, mode: 'pct', pct: p })
    } else {
      return err('op')
    }
  }

  const baseType = { matte: 'matte', gloss: 'gloss' }[typeOf(baseLabel)] || 'base'
  return { recipe: { baseLabel, baseType, basis: 'baseThinner', groups, items } }
}

const n4 = (x) => String(+(+x || 0).toFixed(4))

/** 배합 → 표기 (편집용, 숫자는 . 소수점). 예전 '주제만 기준 %' 는 앞 재료 전체 기준으로 바꿔 쓴다. */
export function serialize(r, baseFallback = '', nameOf = (it) => it.label) {
  const c = coefs({ ...r, basis: 'base' })
  const fixed = r.items.filter((it) => kindOf(it) !== 'pct').reduce((a, it) => a + (c[it.id] || 0), 0)
  const pctScale = r.basis === 'baseThinner' ? 1 : 1 / (1 + fixed)
  const parts = [`${r.baseLabel?.trim() || baseFallback} 1`]
  for (const it of r.items) if (kindOf(it) === 'ratio') parts.push(`${nameOf(it)} ${n4(it.pct / 100)}`)
  for (const g of r.groups || []) {
    const m = r.items.filter((it) => it.group === g.id)
    if (m.length) parts.push(`(${m.map((it) => `${nameOf(it)} ${n4(it.part)}`).join(' : ')}) ${n4(g.ratio)}`)
  }
  let s = parts.join(' : ')
  for (const it of r.items) if (kindOf(it) === 'pct') s += ` + ${nameOf(it)} ${n4(it.pct * pctScale)}%`
  return s
}
