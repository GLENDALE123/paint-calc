import { useMemo, useState } from 'react'
import { useStore, matName, parseNum } from '../store.jsx'
import { LANGS } from '../i18n.js'
import { mixAmounts, correction, kindOf } from '../calc.js'
import { baseName, itemDetail, editVal, fromVal, flatten, formula } from '../recipe.js'
import { serialize } from '../formula.js'
import { Screen, GlassButton, Section, Row, NumInput, PopUp, Icon, CheckCircle, PrimaryButton, Hero, Segmented } from '../ui.jsx'

export { baseName, itemDetail }

const when = (ts, t, fmt) => {
  const d = new Date(ts), now = new Date()
  const same = d.toDateString() === now.toDateString()
  return (same ? t('today') : fmt.date(ts)) + ' ' + fmt.time(ts)
}

const Swatch = ({ color }) => (
  <span className="h-[30px] w-[30px] flex-none rounded-lg" style={{ background: color, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)' }} />
)

/* ---------- 배합 값 편집: 키 → 문자열 ---------- */
// i:<id> = 재료 값 (1 : x 의 x, 묶음 안 몫, %),  g:<id> = 묶음 비율
export function valsOf(r) {
  const v = {}
  for (const g of r.groups || []) v['g:' + g.id] = String(+(+g.ratio || 0).toFixed(4))
  for (const it of r.items) v['i:' + it.id] = editVal(it)
  return v
}
export function applyVals(r, v) {
  return {
    ...r,
    groups: (r.groups || []).map((g) => ({ ...g, ratio: parseNum(v['g:' + g.id]) || 0 })),
    items: r.items.map((it) => ({ ...it, ...fromVal(it, v['i:' + it.id]) })),
  }
}
const same = (a, b) => Math.abs((parseNum(a) || 0) - (parseNum(b) || 0)) < 1e-9

/** 메모 모양 줄 목록. onChange 가 있으면 숫자를 바로 고칠 수 있다. orig 와 다른 값은 주황색. */
export function Lines({ recipe, vals, orig, onChange }) {
  const { t } = useStore()
  const base = baseName(recipe, t)
  const cell = (key, unit) => {
    const changed = orig && !same(vals[key], orig[key])
    return (
      <span className="flex flex-none items-center gap-2">
        {changed && <span className="num text-[15px] text-label2 line-through">{orig[key]}{unit}</span>}
        {onChange ? (
          <span className={`flex items-center rounded-[10px] px-2 ${changed ? 'bg-orange text-white' : 'bg-fill'}`}>
            <NumInput value={vals[key]} onChange={(v) => onChange(key, v)} label={key} className={`w-14 py-1.5 text-[17px] font-semibold ${changed ? 'text-white focus:text-white' : ''}`} />
            {unit && <span className="text-[15px] font-semibold">{unit}</span>}
          </span>
        ) : (
          <span className="num text-[17px] font-semibold">{vals[key]}{unit}</span>
        )}
      </span>
    )
  }
  const rows = [{ key: 'base', body: <><span className="flex-1 text-[17px] font-semibold">{base}</span><span className="num text-[17px] font-semibold">1</span></> }]
  for (const it of recipe.items) if (kindOf(it) === 'ratio') {
    rows.push({ key: it.id, body: <><span className="flex-1 pl-4 text-[17px]">: {matName(it, t)}</span>{cell('i:' + it.id, '')}</> })
  }
  for (const g of recipe.groups || []) {
    const m = recipe.items.filter((it) => it.group === g.id)
    if (!m.length) continue
    rows.push({ key: g.id, body: <><span className="flex-1 pl-4 text-[17px]">: ( {t('premix')} )</span>{cell('g:' + g.id, '')}</> })
    for (const it of m) rows.push({ key: it.id, body: <><span className="flex-1 pl-9 text-[17px]">{matName(it, t)}</span><span className="text-[13px] text-label2">{t('partWord')}</span>{cell('i:' + it.id, '')}</> })
  }
  for (const it of recipe.items) if (kindOf(it) === 'pct') {
    rows.push({ key: it.id, body: <><span className="flex-1 text-[17px]">+ {matName(it, t)}</span>{cell('i:' + it.id, '%')}</> })
  }
  return rows.map((r, i) => <Row key={r.key} last={i === rows.length - 1}>{r.body}</Row>)
}

/* ---------- ① 작업 ---------- */
export function Home({ nav }) {
  const { state, t, fmt, setLang } = useStore()
  const [q, setQ] = useState('')
  const cans = [...state.cans].sort((a, b) => b.updatedAt - a.updatedAt)
  const text = (r) => `${r.name} ${serialize(r, baseName(r, t), (it) => matName(it, t))}`.toLowerCase()
  const recipes = [...state.recipes].sort((a, b) => (b.usedAt || 0) - (a.usedAt || 0) || a.name.localeCompare(b.name))
  const found = q.trim() ? recipes.filter((r) => text(r).includes(q.trim().toLowerCase())) : recipes.slice(0, 5)

  return (
    <Screen large title={t('tabWork')}
      right={
        <GlassButton label={t('language')} className="relative !w-11 !px-0">
          <Icon.globe width="22" height="22" />
          <PopUp value={state.lang} label={t('language')} onChange={setLang} className="!absolute inset-0 opacity-0"
            options={LANGS.map((l) => ({ value: l.code, label: l.name }))} />
        </GlassButton>
      }>
      <label className="-mt-3 flex h-11 items-center gap-2 rounded-full bg-fill px-3 text-label2">
        <Icon.search />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')} enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-[17px] text-label outline-none placeholder:text-label3" />
      </label>

      <Section header={<span>{t('recentRecipes')}</span>} footer={q && !found.length ? t('noMatch') : null}>
        {found.map((r) => (
          <Row key={r.id} className="min-h-[60px]" onClick={() => nav.push({ name: 'can', recipeId: r.id })}>
            <Swatch color={r.color} />
            <span className="flex min-w-0 flex-1 flex-col py-2.5">
              <span className="truncate text-[17px]">{r.name || baseName(r, t)}</span>
              <span className="truncate text-[15px] text-label2">{formula(r, t, fmt)}</span>
            </span>
            <Icon.chevron className="text-label3" />
          </Row>
        ))}
        <Row last onClick={() => nav.push({ name: 'build', then: 'can' })} className="text-blue">
          <Icon.plusCircle /><span className="text-[17px]">{t('newRecipe')}</span>
        </Row>
      </Section>

      {cans.length > 0 && (
        <Section header={<span>{t('cansFix')}</span>}>
          {cans.slice(0, 10).map((c, i, a) => (
            <Row key={c.id} last={i === a.length - 1} className="min-h-[60px]" onClick={() => nav.push({ name: 'can', canId: c.id })}>
              <Swatch color={c.color} />
              <span className="flex min-w-0 flex-1 flex-col py-2.5">
                <span className="truncate text-[17px]">{c.name || t('untitled')} · {t('canNo', { n: c.no })}</span>
                <span className="text-[15px] text-label2">{when(c.updatedAt, t, fmt)}</span>
              </span>
              <span className="num text-[17px] text-label2">{fmt.num(c.totalKg, 1)} kg</span>
              <Icon.chevron className="text-label3" />
            </Row>
          ))}
        </Section>
      )}
    </Screen>
  )
}

/* ---------- 계산 (화면 공용) ---------- */
export function plan({ mode, target, current, baseG, totalG, capG, how = 'remove' }) {
  if (mode === 'new') {
    const { rows, totalG: finalG } = mixAmounts({ baseG, ...target })
    const steps = [{ id: '__base', add: baseG, from: 0, to: baseG }, ...rows.map((r) => ({ id: r.id, add: r.g, from: 0, to: r.g }))]
      .filter((s) => s.add > 0.05)
    return { steps, keep: [], stuck: [], startG: 0, finalG, addG: finalG, removeG: 0, over: capG > 0 && finalG > capG + 0.5, allG: finalG }
  }
  const full = correction({ totalG, current, target })
  const over = capG > 0 && full.finalG > capG + 0.5
  const useRemove = over && how === 'remove'
  const x = useRemove ? capG / full.finalG : 1
  const res = useRemove ? correction({ totalG: totalG * x, current, target }) : full
  const steps = []
  if (res.base.addG > 0.5) steps.push({ id: '__base', add: res.base.addG, from: res.base.curG, to: res.base.finalG })
  for (const r of res.rows) if (r.addG > 0.5) steps.push({ id: r.id, add: r.addG, from: r.curG, to: r.finalG })
  return {
    steps, res,
    keep: res.rows.filter((r) => r.addG <= 0.5).map((r) => r.id),
    stuck: res.rows.filter((r) => r.stuck).map((r) => r.id),
    startG: totalG, removeG: totalG * (1 - x), finalG: res.finalG, addG: res.finalG - totalG * x,
    over, allG: full.finalG,
  }
}

/* ---------- ② 통 한 화면 (새로 섞기 = 빈 통) ---------- */
export function Can({ nav, recipeId, canId }) {
  const { state, t, fmt, setTare, setCap, deleteCan } = useStore()
  const can = canId && state.cans.find((c) => c.id === canId)
  const recipe = state.recipes.find((r) => r.id === (can ? can.recipeId : recipeId))
  const mode = can ? 'fix' : 'new'
  const tgt0 = can ? can.target : recipe
  const [tv, setTv] = useState(() => (tgt0 ? valsOf(tgt0) : {}))
  const [sv, setSv] = useState(() => (can ? valsOf(can.state) : {}))
  const [editState, setEditState] = useState(false)
  const [amount, setAmount] = useState('')
  const [by, setBy] = useState('total')
  const [scale, setScale] = useState('')
  const [tare, setTareLocal] = useState(state.tareKg)
  const [cap, setCapLocal] = useState(can?.capKg || state.capKg)
  if (!tgt0) return null

  const orig = valsOf(tgt0)
  const target = applyVals(tgt0, tv)
  const current = can ? applyVals(can.state, sv) : null
  const base = baseName(target, t)
  const capG = (parseNum(cap) || 0) * 1000
  const changed = Object.keys(orig).some((k) => !same(orig[k], tv[k]))

  let input = null
  if (mode === 'new') {
    const kg = parseNum(amount)
    if (kg > 0) {
      const sum = mixAmounts({ baseG: 1000, ...target }).totalG / 1000
      input = { baseG: by === 'base' ? kg * 1000 : (kg * 1000) / sum }
    }
  } else {
    const remain = parseNum(scale) - (parseNum(tare) || 0)
    if (remain > 0) input = { totalG: remain * 1000 }
  }
  const p = input && plan({ mode, target, current, capG, how: 'all', ...input })

  const go = () => {
    setTare(tare); setCap(cap)
    nav.push({ name: 'result', mode, canId, recipeId: recipe?.id, target, current, capG, changed, ...input })
  }
  const remove = () => { if (confirm(t('confirmDeleteCan'))) { deleteCan(can.id); nav.reset() } }

  return (
    <Screen title={can ? `${can.name || t('untitled')} · ${t('canNo', { n: can.no })}` : recipe?.name || base}
      subtitle={t(mode === 'new' ? 'newMix' : 'fixBtn')} tabBar={false}
      left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}
      right={can && <GlassButton label={t('delete')} onClick={remove} className="text-red"><Icon.trash /></GlassButton>}
      bottom={<PrimaryButton disabled={!p} onClick={go}>{p ? t('showAdd') : t('enterWeight')}</PrimaryButton>}>

      <Section header={<span>{t('targetHdr')}</span>}
        footer={changed ? <span className="flex items-center gap-1.5"><span className="h-2 w-2 flex-none rounded-full bg-orange" />{t('onlyThisCan', { name: recipe?.name || base })}</span> : null}>
        <Lines recipe={target} vals={tv} orig={orig} onChange={(k, v) => setTv({ ...tv, [k]: v })} />
      </Section>

      <Section header={<span>{t('nowHdr')}</span>}>
        {mode === 'new' ? (
          <>
            <Row className="min-h-[72px]">
              <span className="flex-1 text-[17px]">{by === 'base' ? base : t('makeTotal')}</span>
              <NumInput value={amount} onChange={setAmount} label={t('amount')} placeholder="0" autoFocus className="w-32 text-[32px] font-bold" />
              <span className="text-[20px] text-label2">kg</span>
            </Row>
            <div className="relative px-4 py-2.5">
              <Segmented value={by} onChange={setBy} options={[{ value: 'total', label: t('makeTotal') }, { value: 'base', label: base }]} />
              <span aria-hidden="true" className="absolute right-0 bottom-0 left-5 h-px scale-y-50 bg-sep" />
            </div>
          </>
        ) : (
          <>
            <Row className="min-h-[72px]">
              <span className="flex-1 text-[17px]">{t('scale')}</span>
              <NumInput value={scale} onChange={setScale} label={t('scale')} placeholder="0" autoFocus className="w-32 text-[32px] font-bold" />
              <span className="text-[20px] text-label2">kg</span>
            </Row>
            <Row>
              <span className="flex-1 text-[15px] text-label2">− {t('tare')}</span>
              <NumInput value={tare} onChange={setTareLocal} label={t('tare')} placeholder="0" className="w-20 text-[17px]" />
              <span className="text-[17px] text-label2">kg</span>
              {input && <span className="num w-24 text-right text-[17px] font-semibold">= {fmt.num(input.totalG / 1000, 1)} kg</span>}
            </Row>
          </>
        )}
        <Row last={mode === 'new'}>
          <span className="flex-1 text-[15px] text-label2">{t('capacity')}</span>
          <NumInput value={cap} onChange={setCapLocal} label={t('capacity')} placeholder="–" className="w-20 text-[17px]" />
          <span className="text-[17px] text-label2">kg</span>
        </Row>
        {mode === 'fix' && (
          <Row last onClick={() => setEditState(!editState)} className="min-h-[56px]">
            <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-green"><Icon.check width="12" height="12" /></span>
            <span className="flex min-w-0 flex-1 flex-col py-2">
              <span className="text-[15px]">{t('recordRow', { time: when(can.updatedAt, t, fmt) })}</span>
              <span className="truncate text-[13px] text-label2">{editState ? t('done') : t('recordSub')}</span>
            </span>
          </Row>
        )}
      </Section>

      {mode === 'fix' && editState && (
        <Section header={<span>{t('currentState')}</span>} footer={t('stateHint')}>
          <Lines recipe={current} vals={sv} orig={valsOf(can.state)} onChange={(k, v) => setSv({ ...sv, [k]: v })} />
        </Section>
      )}

      {p && (
        <Section header={<span>{t('addHdr')}</span>}>
          <Row last onClick={go} className="min-h-[60px]">
            {p.over && <Icon.warn className="flex-none" />}
            <span className="flex min-w-0 flex-1 flex-col py-2">
              <span className="text-[17px]">{p.steps.length ? t('stepsSum', { n: p.steps.length, kg: fmt.num(p.addG / 1000, 1) }) : t('nothing')}</span>
              {capG > 0 && <span className="text-[15px] text-label2">{t(p.over ? 'overCap' : 'fitsCap', { cap: fmt.num(capG / 1000, 1) })}</span>}
            </span>
            <Icon.chevron className="text-label3" />
          </Row>
        </Section>
      )}
    </Screen>
  )
}

/* ---------- ③ 넣을 양 ---------- */
export function Result({ nav, mode, canId, recipeId, target, current, baseG, totalG, capG, changed }) {
  const { state, t, fmt, updateCan, addCan, touchRecipe } = useStore()
  const can = canId && state.cans.find((c) => c.id === canId)
  const recipe = state.recipes.find((r) => r.id === recipeId)
  const [how, setHow] = useState('remove')
  const [done, setDone] = useState({})
  const p = useMemo(() => plan({ mode, target, current, baseG, totalG, capG, how }), [mode, target, current, baseG, totalG, capG, how])

  const byId = Object.fromEntries([...(current?.items || []), ...target.items].map((it) => [it.id, it]))
  const name = (id) => (id === '__base' ? baseName(target, t) : matName(byId[id], t))
  const removeStep = mode === 'fix' && p.removeG > 0.5
  const ids = [...(removeStep ? ['__remove'] : []), ...p.steps.map((s) => s.id)]
  const count = ids.filter((id) => done[id]).length
  const all = count === ids.length

  // 무엇이 바뀌었는지 한 줄 (보정)
  const diff = []
  if (mode === 'fix') {
    const a = valsOf(current), b = valsOf(target)
    for (const it of target.items) {
      const k = 'i:' + it.id
      if (a[k] != null && !same(a[k], b[k])) diff.push(`${matName(it, t)} ${a[k]} → ${b[k]}${kindOf(it) === 'pct' ? '%' : ''}`)
    }
  }

  const finish = () => {
    let st = target
    if (mode === 'fix' && p.stuck.length) {
      const extra = current.items.filter((c) => !target.items.some((x) => x.id === c.id))
      st = { ...target, groups: [], items: flatten([...target.items, ...extra], p.res.rows, p.res.base.finalG) }
    }
    const snap = { target: structuredClone(target), state: structuredClone(st), totalKg: p.finalG / 1000, capKg: capG ? String(capG / 1000) : '' }
    if (can) updateCan(can.id, snap)
    else addCan({ recipeId: recipe.id, name: recipe.name || baseName(recipe, t), color: recipe.color, ...snap })
    if (recipe) touchRecipe(recipe.id)
    nav.reset()
  }

  const hero = mode === 'new'
    ? { label: t('amount'), value: fmt.num(p.finalG / 1000, 2), unit: 'kg', sub: changed ? t('onlyThisCanShort') : formula(target, t, fmt) }
    : { label: diff.join(' · ') || t('addTotal'), value: '+' + fmt.num(p.addG / 1000, 2), unit: 'kg',
      sub: p.stuck.length ? t('why', { names: p.stuck.map(name).join(', ') }) : `${fmt.num(p.startG / 1000, 1)} → ${fmt.num(p.finalG / 1000, 1)} kg` }

  return (
    <Screen title={t(mode === 'new' ? 'newMix' : 'addTitle')} subtitle={`${fmt.num((p.startG - p.removeG) / 1000, 1)} → ${fmt.num(p.finalG / 1000, 1)} kg`} tabBar={false}
      left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}
      bottom={<PrimaryButton disabled={!all} onClick={finish}>{all ? t(mode === 'new' ? 'finishMix' : 'finishFix') : t('left', { n: ids.length - count })}</PrimaryButton>}>
      <Hero {...hero} />

      {p.over && mode === 'fix' && (
        <section className="flex flex-col gap-[7px]">
          <Segmented value={how} onChange={setHow} options={[{ value: 'all', label: t('addAll') }, { value: 'remove', label: t('removeFirst') }]} />
          <p className="m-0 px-4 text-[13px] leading-snug text-label2">{how === 'remove'
            ? t('overNote', { all: fmt.num(p.allG / 1000, 1), cap: fmt.num(capG / 1000, 1), rm: fmt.num(p.removeG / 1000, 1), fit: fmt.num(p.finalG / 1000, 1) })
            : t('overCap', { cap: fmt.num(capG / 1000, 1) })}</p>
        </section>
      )}
      {p.over && mode === 'new' && (
        <p className="m-0 flex items-center gap-2 px-4 text-[13px] text-label2"><Icon.warn width="16" height="15" />{t('overCap', { cap: fmt.num(capG / 1000, 1) })}</p>
      )}

      {ids.length === 0 ? (
        <Section><Row last><span className="text-[17px]">{t('nothing')}</span></Row></Section>
      ) : (
        <Section header={<><span>{t('order')}</span><span>{t('ofN', { n: count, m: ids.length })}</span></>}
          footer={removeStep ? t('recheck') : null}>
          {removeStep && (
            <Row className="min-h-[66px]" onClick={() => setDone((d) => ({ ...d, __remove: !d.__remove }))}>
              <CheckCircle on={!!done.__remove} />
              <span className={`flex min-w-0 flex-1 flex-col ${done.__remove ? 'opacity-40' : ''}`}>
                <span className={`text-[17px] ${done.__remove ? 'line-through' : ''}`}>{t('removeRow')}</span>
                <span className="num text-[13px] text-label2">{t('removeSub', { from: fmt.num(p.startG / 1000, 1), to: fmt.num((p.startG - p.removeG) / 1000, 1) })}</span>
              </span>
              <span className={`num text-[26px] font-bold text-orange ${done.__remove ? 'opacity-40' : ''}`}>−{fmt.num(p.removeG / 1000, 1)}<span className="text-[15px] font-medium"> kg</span></span>
            </Row>
          )}
          {p.steps.map((s, i) => {
            const on = !!done[s.id]
            const grp = s.id !== '__base' && byId[s.id]?.group
            return (
              <Row key={s.id} last={i === p.steps.length - 1 && !p.keep.length} className="min-h-[64px]" onClick={() => setDone((d) => ({ ...d, [s.id]: !d[s.id] }))}>
                <CheckCircle on={on} />
                <span className={`flex min-w-0 flex-1 flex-col ${on ? 'opacity-40' : ''}`}>
                  <span className={`text-[17px] ${on ? 'line-through' : ''}`}>{name(s.id)}</span>
                  {(grp || mode === 'fix') && <span className="num text-[13px] text-label2">{grp ? t('premix') : `${fmt.num(s.from, 0)} → ${fmt.num(s.to, 0)} g`}</span>}
                </span>
                <span className={`num text-[26px] font-bold ${on ? 'opacity-40' : mode === 'fix' ? 'text-blue' : ''}`}>
                  {mode === 'fix' ? '+' : ''}{fmt.num(s.add, s.add >= 1000 ? 0 : 1)}<span className="text-[15px] font-medium"> g</span>
                </span>
              </Row>
            )
          })}
          {p.keep.map((id, i) => (
            <Row key={id} last={i === p.keep.length - 1} className="min-h-[56px]">
              <span className="flex h-7 w-7 flex-none items-center justify-center text-[20px] text-label3">–</span>
              <span className="flex-1 text-[17px] text-label2">{name(id)}</span>
              <span className="text-[17px] text-label2">{t('keep')}</span>
            </Row>
          ))}
        </Section>
      )}
    </Screen>
  )
}
