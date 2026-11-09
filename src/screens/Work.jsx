import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useStore, matName, parseNum } from '../store.jsx'
import { LANGS } from '../i18n.js'
import { mixAmounts, correction, kindOf } from '../calc.js'
import { baseName, itemDetail, editVal, fromVal, flatten, formula } from '../recipe.js'
import { Screen, GlassButton, Section, Row, Dot, NumInput, PopUp, Icon, CheckCircle, PrimaryButton, Hero } from '../ui.jsx'

export { baseName, itemDetail }

const when = (ts, t, fmt) => {
  const d = new Date(ts), now = new Date()
  const same = d.toDateString() === now.toDateString()
  return (same ? t('today') : fmt.date(ts)) + ' ' + fmt.time(ts)
}

/* ① 작업 선택 */
export function Home({ nav }) {
  const { state, t, fmt, setLang } = useStore()
  const cans = [...state.cans].sort((a, b) => b.updatedAt - a.updatedAt)
  return (
    <Screen large title={t('tabWork')}
      right={
        <GlassButton label={t('language')} className="gap-1.5 !px-3.5 text-[15px]">
          <Icon.globe />
          <PopUp value={state.lang} label={t('language')} onChange={setLang} className="!text-label !text-[15px]"
            options={LANGS.map((l) => ({ value: l.code, label: l.name }))} />
        </GlassButton>
      }>
      <p className="-mt-5 mx-1 mb-0 text-[17px] text-label2">{t('ask')}</p>

      <div className="flex flex-col gap-3">
        <BigCard color="var(--blue)" icon={<Icon.flask width="30" height="30" />} title={t('newMix')} sub={t('newMixSub')}
          onClick={() => nav.push({ name: 'pickRecipe', mode: 'mix' })} />
        <BigCard color="var(--orange)" icon={<Icon.scale width="30" height="30" stroke="#fff" />} title={t('fix')} sub={t('fixSub')}
          onClick={() => nav.push({ name: 'pickCan' })} />
      </div>

      {cans.length > 0 && (
        <Section header={<span>{t('cans')}</span>} footer={t('cansFooter')}>
          {cans.slice(0, 8).map((c, i) => (
            <CanRow key={c.id} can={c} last={i === Math.min(cans.length, 8) - 1} onClick={() => nav.push({ name: 'weigh', canId: c.id })} />
          ))}
        </Section>
      )}
    </Screen>
  )
}

function BigCard({ color, icon, title, sub, onClick }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onClick}
      className="flex items-center gap-4 rounded-[26px] bg-card p-5 text-left">
      <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl text-white" style={{ background: color }}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[22px] font-bold leading-tight">{title}</span>
        <span className="text-[15px] leading-snug text-label2">{sub}</span>
      </span>
      <Icon.chevron className="flex-none text-label3" />
    </motion.button>
  )
}

function CanRow({ can, last, onClick }) {
  const { t, fmt } = useStore()
  return (
    <Row onClick={onClick} last={last} className="min-h-[62px]">
      <span className="h-[30px] w-[30px] flex-none rounded-lg" style={{ background: can.color, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)' }} />
      <span className="flex min-w-0 flex-1 flex-col py-2.5">
        <span className="truncate text-[17px]">{can.name || t('untitled')} · {t('canNo', { n: can.no })}</span>
        <span className="num text-[15px] text-label2">{when(can.updatedAt, t, fmt)} · {fmt.num(can.totalKg, 2)} kg</span>
      </span>
      <span className="text-[15px] font-semibold text-blue">{t('fixBtn')}</span>
    </Row>
  )
}

/* 배합 고르기 (새로 섞기 / 기록 없는 통 보정) */
export function PickRecipe({ nav, mode }) {
  const { state, t, fmt } = useStore()
  // 여기서 만든 배합은 저장 후 바로 이 흐름(섞기/계량)으로 돌아온다
  const create = () => nav.push({ name: 'editRecipe', then: mode === 'mix' ? 'mix' : 'weigh' })
  return (
    <Screen title={t('pickRecipe')} left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}
      right={<GlassButton label={t('newRecipe')} onClick={create}><Icon.plus /></GlassButton>}>
      {state.recipes.length === 0 ? (
        <Section>
          <Row onClick={create} last className="text-blue"><Icon.plusCircle /> {t('newRecipe')}</Row>
        </Section>
      ) : (
        <Section>
          {state.recipes.map((r, i) => (
            <Row key={r.id} last={i === state.recipes.length - 1} className="min-h-[60px]"
              onClick={() => nav.push(mode === 'mix' ? { name: 'mix', recipeId: r.id } : { name: 'weigh', recipeId: r.id })}>
              <span className="h-[30px] w-[30px] flex-none rounded-lg" style={{ background: r.color }} />
              <span className="flex min-w-0 flex-1 flex-col py-2.5">
                <span className="truncate text-[17px]">{r.name || t('untitled')}</span>
                <span className="truncate text-[15px] text-label2">{formula(r, t, fmt)}</span>
              </span>
              <Icon.chevron className="text-label3" />
            </Row>
          ))}
        </Section>
      )}
      {state.recipes.length === 0 && <p className="m-0 px-4 text-center text-[15px] text-label2">{t('noRecipes')}</p>}
    </Screen>
  )
}

/* ② 새로 섞기: 주제 무게 → 순서대로 체크 */
export function Mix({ nav, recipeId }) {
  const { state, t, fmt, addCan } = useStore()
  const r = state.recipes.find((x) => x.id === recipeId)
  const [kg, setKg] = useState('')
  const [done, setDone] = useState({})
  if (!r) return null
  const baseKg = parseNum(kg)
  const ok = baseKg > 0
  const { rows, totalG } = mixAmounts({ baseG: ok ? baseKg * 1000 : 0, basis: r.basis, groups: r.groups, items: r.items })
  const count = r.items.filter((it) => done[it.id]).length
  const all = ok && count === r.items.length

  const finish = () => {
    addCan({ recipeId: r.id, name: r.name, color: r.color, baseType: r.baseType, baseLabel: r.baseLabel, basis: r.basis,
      groups: (r.groups || []).map((g) => ({ ...g })), items: r.items.map((x) => ({ ...x })), totalKg: totalG / 1000 })
    nav.reset()
  }

  return (
    <Screen title={r.name || t('untitled')} subtitle={t('newMix')} tabBar={false}
      left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}
      bottom={<PrimaryButton disabled={!all} onClick={finish}>{!ok ? t('enterWeight') : all ? t('finishMix') : t('left', { n: r.items.length - count })}</PrimaryButton>}>
      <Section header={<span>{t('mixStep1', { base: baseName(r, t) })}</span>}>
        <label className="flex min-h-[76px] items-center gap-2 px-[22px]">
          <Dot color="#8E8E93" />
          <span className="flex-1 text-[17px]">{baseName(r, t)}</span>
          <NumInput value={kg} onChange={setKg} label={baseName(r, t)} placeholder="0" autoFocus className="w-32 text-[34px] font-bold" />
          <span className="text-[20px] text-label2">kg</span>
        </label>
      </Section>

      <Section header={<><span>{t('mixStep2')}</span><span>{t('ofN', { n: count, m: r.items.length })}</span></>} footer={t('mixHint')}>
        {r.items.map((it, i) => {
          const on = !!done[it.id]
          return (
            <Row key={it.id} className="min-h-[68px]" onClick={() => setDone((d) => ({ ...d, [it.id]: !d[it.id] }))}>
              <CheckCircle on={on} />
              <span className={`flex min-w-0 flex-1 flex-col transition-opacity ${on ? 'opacity-40' : ''}`}>
                <span className={`text-[17px] ${on ? 'line-through' : ''}`}>{matName(it, t)}</span>
                <span className="truncate text-[15px] text-label2">{itemDetail(it, r, t, fmt)}</span>
              </span>
              <span className={`num text-[26px] font-bold transition-opacity ${on ? 'opacity-40' : ''}`}>
                {ok ? fmt.num(rows[i].g, 1) : '–'}<span className="text-[15px] font-medium text-label2"> g</span>
              </span>
            </Row>
          )
        })}
        <Row last>
          <span className="flex-1 text-[17px]">{t('totalInCan')}</span>
          <span className="num text-[17px] font-semibold">{ok ? fmt.num(totalG / 1000, 3) : '–'} kg</span>
        </Row>
      </Section>
    </Screen>
  )
}

/* 보정할 통 고르기 */
export function PickCan({ nav }) {
  const { state, t } = useStore()
  const cans = [...state.cans].sort((a, b) => b.updatedAt - a.updatedAt)
  return (
    <Screen title={t('pickCan')} left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}>
      {cans.length > 0 && (
        <Section header={<span>{t('cans')}</span>}>
          {cans.map((c, i) => <CanRow key={c.id} can={c} last={i === cans.length - 1} onClick={() => nav.push({ name: 'weigh', canId: c.id })} />)}
        </Section>
      )}
      <Section footer={t('noRecordSub')}>
        <Row last onClick={() => nav.push({ name: 'pickRecipe', mode: 'manual' })}>
          <span className="flex-1 text-[17px]">{t('noRecord')}</span>
          <Icon.chevron className="text-label3" />
        </Row>
      </Section>
    </Screen>
  )
}

/* ③ 보정: 통 계량 + 지금 통 상태 */
export function Weigh({ nav, canId, recipeId }) {
  const { state, t, fmt, setTare, deleteCan } = useStore()
  const can = canId && state.cans.find((c) => c.id === canId)
  const recipe = state.recipes.find((r) => r.id === (can ? can.recipeId : recipeId))
  const src = can || recipe
  const [scale, setScale] = useState('')
  const [tare, setTareLocal] = useState(state.tareKg)
  const [editing, setEditing] = useState(!can)
  // 편집 값: 신나는 1 : x 의 x, 나머지는 %
  const [cur, setCur] = useState(() => (src ? src.items.map((it) => ({ ...it, val: editVal(it) })) : []))
  if (!src) return null

  const remain = parseNum(scale) - (parseNum(tare) || 0)
  const ok = remain > 0
  const meta = { baseType: src.baseType, baseLabel: src.baseLabel, basis: src.basis, groups: src.groups || [], items: src.items }
  const live = ({ val, ...y }) => ({ ...y, ...fromVal(y, val) })
  const liveRecipe = { ...meta, items: cur.map(live) }
  const unit = (x) => ({ group: [t('partWord'), ''], ratio: ['1 :', ''], pct: ['', '%'] })[kindOf(x)]
  const setVal = (id, v) => setCur(cur.map((y) => (y.id === id ? { ...y, val: v } : y)))

  const go = () => {
    setTare(tare)
    const current = { basis: src.basis, groups: src.groups || [], items: cur.map(live) }
    nav.push({ name: 'fixResult', canId: can?.id, recipeId: recipe?.id, totalG: remain * 1000, current })
  }
  const remove = () => { if (confirm(t('confirmDeleteCan'))) { deleteCan(can.id); nav.reset() } }

  return (
    <Screen title={t('weigh')} subtitle={`${src.name || t('untitled')}${can ? ' · ' + t('canNo', { n: can.no }) : ''}`} tabBar={false}
      left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}
      right={can && <GlassButton label={t('delete')} onClick={remove} className="text-red"><Icon.trash /></GlassButton>}
      bottom={<PrimaryButton disabled={!ok} onClick={go}>{t('calcAdd')}</PrimaryButton>}>
      <Section header={<span>{t('weighStep1')}</span>} footer={t('tareHint')}>
        <Row className="min-h-[76px]">
          <span className="flex-1 text-[17px]">{t('scale')}</span>
          <NumInput value={scale} onChange={setScale} label={t('scale')} placeholder="0" autoFocus className="w-32 text-[34px] font-bold" />
          <span className="text-[20px] text-label2">kg</span>
        </Row>
        <Row last>
          <span className="flex-1 text-[17px]">− {t('tare')}</span>
          <NumInput value={tare} onChange={setTareLocal} label={t('tare')} placeholder="0" className="w-24 text-[17px] text-label2" />
          <span className="text-[17px] text-label2">kg</span>
        </Row>
      </Section>

      <div className="flex items-center justify-between rounded-[26px] bg-card px-[22px] py-4">
        <span className="text-[17px]">{t('remain')}</span>
        <span className="num text-[28px] font-bold">{ok ? fmt.num(remain, 3) : '–'}<span className="text-[17px] font-medium text-label2"> kg</span></span>
      </div>

      <Section header={<><span>{t('weighStep2')}</span>{can && <button type="button" className="text-blue" onClick={() => setEditing(!editing)}>{editing ? t('done') : t('edit')}</button>}</>}
        footer={can ? t('stateHint') : null}>
        {!editing ? (
          <Row last>
            <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-green"><Icon.check /></span>
            <span className="flex min-w-0 flex-1 flex-col py-2.5">
              <span className="text-[17px]">{t('fromMix', { time: when(can.updatedAt, t, fmt) })}</span>
              <span className="text-[15px] text-label2">{formula(liveRecipe, t, fmt)}</span>
            </span>
          </Row>
        ) : (
          cur.map((x, i) => (
            <Row key={x.id} last={i === cur.length - 1}>
              <span className="flex min-w-0 flex-1 flex-col py-2">
                <span className="text-[17px]">{matName(x, t)}</span>
                <span className="text-[13px] text-label2">{itemDetail(live(x), liveRecipe, t, fmt)}</span>
              </span>
              {unit(x)[0] && <span className="text-[17px] text-label2">{unit(x)[0]}</span>}
              <NumInput value={x.val} label={matName(x, t)} className="w-20 text-[17px]" onChange={(v) => setVal(x.id, v)} />
              {unit(x)[1] && <span className="text-[17px] text-label2">{unit(x)[1]}</span>}
            </Row>
          ))
        )}
      </Section>
      {recipe && <p className="m-0 -mt-3 px-4 text-[13px] text-label2">{t('targetIs', { name: recipe.name || t('untitled') })}</p>}
    </Screen>
  )
}

/* ④ 보정 결과: 더 넣을 양 체크리스트 */
export function FixResult({ nav, canId, recipeId, totalG, current }) {
  const { state, t, fmt, updateCan, addCan } = useStore()
  const can = canId && state.cans.find((c) => c.id === canId)
  const recipe = state.recipes.find((r) => r.id === recipeId)
  const targetSrc = recipe || can
  const [done, setDone] = useState({})

  const res = useMemo(() => targetSrc && correction({ totalG, current, target: { basis: targetSrc.basis, groups: targetSrc.groups || [], items: targetSrc.items } }), [targetSrc, totalG, current])
  if (!targetSrc) return null

  const names = Object.fromEntries([...current.items, ...targetSrc.items].map((it) => [it.id, it]))
  const steps = []
  if (res.base.addG > 0.5) steps.push({ id: '__base', name: baseName(targetSrc, t), add: res.base.addG, from: res.base.curG, to: res.base.finalG })
  for (const row of res.rows) {
    if (row.addG > 0.5) steps.push({ id: row.id, name: matName(names[row.id], t), add: row.addG, from: row.curG, to: row.finalG })
  }
  const stuck = res.rows.filter((r) => r.stuck).map((r) => matName(names[r.id], t))
  const keep = res.rows.filter((r) => r.addG <= 0.5).map((r) => matName(names[r.id], t))
  const count = steps.filter((s) => done[s.id]).length
  const all = count === steps.length

  const finish = () => {
    const extra = current.items.filter((c) => !targetSrc.items.some((x) => x.id === c.id))
    const list = [...targetSrc.items, ...extra].map((x) => ({ ...x }))
    // 덜어낼 수 없어 목표보다 많이 남은 성분이 있으면, 실제 들어간 양 그대로(주제 1 : x) 기록
    const stuckAny = res.rows.some((r) => r.stuck)
    const snap = { baseType: targetSrc.baseType, baseLabel: targetSrc.baseLabel, basis: targetSrc.basis, totalKg: res.finalG / 1000,
      groups: stuckAny ? [] : (targetSrc.groups || []).map((g) => ({ ...g })),
      items: stuckAny ? flatten(list, res.rows, res.base.finalG) : list }
    if (can) updateCan(can.id, snap)
    else addCan({ recipeId: recipe.id, name: recipe.name, color: recipe.color, ...snap })
    nav.reset()
  }

  return (
    <Screen title={t('addTitle')} subtitle={targetSrc.name || t('untitled')} tabBar={false}
      left={<GlassButton label={t('back')} onClick={nav.pop}><Icon.back /></GlassButton>}
      bottom={<PrimaryButton disabled={!all} onClick={finish}>{all ? t('finishFix') : t('left', { n: steps.length - count })}</PrimaryButton>}>
      <Hero label={t('addTotal')} value={fmt.num(res.addTotalG, 0)} unit="g"
        sub={`${fmt.num(totalG / 1000, 2)} kg → ${fmt.num(res.finalG / 1000, 2)} kg`} />

      {steps.length === 0 ? (
        <Section><Row last><span className="text-[17px]">{t('nothing')}</span></Row></Section>
      ) : (
        <Section header={<><span>{t('order')}</span><span>{t('ofN', { n: count, m: steps.length })}</span></>}
          footer={stuck.length ? t('stuckNote', { names: stuck.join(', ') }) : null}>
          {steps.map((s) => {
            const on = !!done[s.id]
            return (
              <Row key={s.id} className="min-h-[68px]" onClick={() => setDone((d) => ({ ...d, [s.id]: !d[s.id] }))}>
                <CheckCircle on={on} />
                <span className={`flex min-w-0 flex-1 flex-col transition-opacity ${on ? 'opacity-40' : ''}`}>
                  <span className={`text-[17px] ${on ? 'line-through' : ''}`}>{s.name}</span>
                  <span className="num text-[15px] text-label2">{fmt.num(s.from, 0)} → {fmt.num(s.to, 0)} g</span>
                </span>
                <span className={`num text-[26px] font-bold transition-opacity ${on ? 'opacity-40' : 'text-blue'}`}>
                  +{fmt.num(s.add, 1)}<span className="text-[15px] font-medium"> g</span>
                </span>
              </Row>
            )
          })}
          {keep.map((n) => (
            <Row key={n} className="min-h-[56px]">
              <span className="flex h-7 w-7 flex-none items-center justify-center text-[20px] text-label3">–</span>
              <span className="flex-1 text-[17px] text-label2">{n}</span>
              <span className="text-[17px] text-label2">{t('keep')}</span>
            </Row>
          ))}
        </Section>
      )}
    </Screen>
  )
}
