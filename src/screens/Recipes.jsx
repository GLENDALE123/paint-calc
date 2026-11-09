import { useRef, useState } from 'react'
import { useStore, uid, matName, parseNum, MATERIAL_TYPES, BASE_TYPES, COLORS, exportPayload, parseImport } from '../store.jsx'
import { isThinner, ratioToPct } from '../calc.js'
import { Screen, GlassButton, Section, Row, NumInput, PopUp, Icon, Segmented } from '../ui.jsx'
import { baseName, itemDetail } from './Work.jsx'

export function RecipeList({ nav }) {
  const { state, t, fmt, importRecipes } = useStore()
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')

  const doExport = async () => {
    const text = exportPayload(state.recipes)
    const name = `paint-recipes-${new Date().toISOString().slice(0, 10)}.json`
    const file = new File([text], name, { type: 'application/json' })
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return }
    } catch (e) { if (e?.name === 'AbortError') return }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file); a.download = name; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }
  const doImport = async (e) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    try { setMsg(t('importDone', { n: importRecipes(parseImport(await f.text())) })) } catch { setMsg(t('importFail')) }
  }

  return (
    <Screen large title={t('recipes')}
      right={<GlassButton label={t('newRecipe')} onClick={() => nav.push({ name: 'editRecipe' })}><Icon.plus /></GlassButton>}>
      <Section footer={state.recipes.length === 0 ? t('noRecipes') : null}>
        {state.recipes.map((r) => (
          <Row key={r.id} className="min-h-[60px]" onClick={() => nav.push({ name: 'editRecipe', id: r.id })}>
            <span className="h-[30px] w-[30px] flex-none rounded-lg" style={{ background: r.color, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)' }} />
            <span className="flex min-w-0 flex-1 flex-col py-2.5">
              <span className="truncate text-[17px]">{r.name || t('untitled')}</span>
              <span className="truncate text-[15px] text-label2">{r.items.map((it) => `${matName(it, t)} ${isThinner(it) ? '1:' + fmt.num(it.pct / 100, 2) : fmt.num(it.pct, 2) + '%'}`).join(' · ')}</span>
            </span>
            <Icon.chevron className="text-label3" />
          </Row>
        ))}
        <Row last onClick={() => nav.push({ name: 'editRecipe' })} className="text-blue"><Icon.plusCircle /><span className="text-[17px]">{t('newRecipe')}</span></Row>
      </Section>

      <Section footer={msg || t('shareHint')}>
        <Row onClick={doExport} className="text-blue"><Icon.share /><span className="text-[17px]">{t('exportAll')}</span></Row>
        <Row last onClick={() => fileRef.current?.click()} className="text-blue"><Icon.download /><span className="text-[17px]">{t('importAll')}</span></Row>
      </Section>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
    </Screen>
  )
}

const toDraft = (r) => ({
  ...r,
  items: r.items.map((it) => ({ ...it, val: String(+(isThinner(it) ? it.pct / 100 : it.pct).toFixed(4)) })),
})
const fromDraft = (d) => ({
  ...d,
  name: d.name.trim(),
  items: d.items.map(({ val, ...it }) => ({ ...it, pct: (parseNum(val) || 0) * (isThinner(it) ? 100 : 1) })),
})

export function EditRecipe({ nav, id, then }) {
  const { state, t, fmt, saveRecipe, deleteRecipe } = useStore()
  const existing = state.recipes.find((r) => r.id === id)
  const [d, setD] = useState(() => toDraft(existing || {
    id: uid(), name: '', color: COLORS[0], baseType: 'base', basis: 'base',
    items: [{ id: uid(), type: 'thinner', label: '', pct: 0 }, { id: uid(), type: 'pigment', label: '', pct: 0 }],
  }))
  const [ratio, setRatio] = useState(null) // { total, parts: {id: val} }

  const set = (patch) => setD((x) => ({ ...x, ...patch }))
  const setItem = (iid, patch) => setD((x) => ({ ...x, items: x.items.map((it) => (it.id === iid ? { ...it, ...patch } : it)) }))
  const base = t('type.' + d.baseType)
  const hasThinner = d.items.some(isThinner)
  const others = d.items.filter((it) => !isThinner(it))
  const preview = fromDraft(d)

  const save = () => {
    saveRecipe(fromDraft(d))
    if (then) { nav.pop(); nav.push({ name: then, recipeId: d.id }) } else nav.pop()
  }
  const remove = () => { if (confirm(t('confirmDeleteRecipe'))) { deleteRecipe(d.id); nav.pop() } }
  const applyRatio = () => {
    const pcts = ratioToPct(others.map((it) => parseNum(ratio.parts[it.id]) || 0), parseNum(ratio.total) || 0)
    setD((x) => ({ ...x, items: x.items.map((it) => {
      const i = others.findIndex((o) => o.id === it.id)
      return i < 0 ? it : { ...it, val: String(+pcts[i].toFixed(4)) }
    }) }))
    setRatio(null)
  }

  return (
    <Screen title={d.name || t('newRecipe')} tabBar={false}
      left={<GlassButton label={t('cancel')} onClick={nav.pop}><Icon.back /></GlassButton>}
      right={<button type="button" onClick={save} className="h-11 rounded-full bg-blue px-5 text-[17px] font-semibold text-white active:scale-95">{t('done')}</button>}>

      <Section>
        <Row>
          <span className="w-24 flex-none text-[17px]">{t('recipeName')}</span>
          <input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder={t('recipeNamePh')} aria-label={t('recipeName')}
            className="min-w-0 flex-1 bg-transparent text-right text-[17px] outline-none placeholder:text-label3" />
        </Row>
        <Row>
          <span className="flex-1 text-[17px]">{t('color')}</span>
          <div className="flex flex-wrap justify-end gap-1.5 py-2">
            {COLORS.map((c) => (
              <button key={c} type="button" aria-label={c} aria-pressed={d.color === c} onClick={() => set({ color: c })}
                className="h-7 w-7 rounded-full" style={{ background: c, boxShadow: d.color === c ? '0 0 0 2px var(--card), 0 0 0 4px var(--blue)' : 'inset 0 0 0 0.5px rgba(0,0,0,0.2)' }} />
            ))}
          </div>
        </Row>
        <Row last>
          <span className="flex-1 text-[17px]">{t('baseType')}</span>
          <PopUp value={d.baseType} label={t('baseType')} onChange={(v) => set({ baseType: v })}
            options={BASE_TYPES.map((b) => ({ value: b, label: t('type.' + b) }))} />
        </Row>
      </Section>

      <Section header={<><span>{t('materials')}</span>
        {others.length > 1 && <button type="button" className="text-blue" onClick={() => setRatio(ratio ? null : { total: '', parts: {} })}>{t('ratioMode')}</button>}</>}
        footer={<>{t('outerHint', { base })}{hasThinner ? ' ' + t('thinnerHint', { base, thinner: t('type.thinner') }) : ''}</>}>
        {d.items.map((it) => (
          <div key={it.id} className="relative flex flex-col gap-1 px-5 py-3">
            <div className="flex items-center gap-3">
              <button type="button" aria-label={t('delete')} onClick={() => set({ items: d.items.filter((x) => x.id !== it.id) })}><Icon.minusCircle /></button>
              <PopUp value={it.type} label={t('materials')} className="!text-label flex-none"
                onChange={(v) => setItem(it.id, { type: v })} options={MATERIAL_TYPES.map((m) => ({ value: m, label: t('type.' + m) }))} />
              <input value={it.label} onChange={(e) => setItem(it.id, { label: e.target.value })} placeholder={t('materialLabelPh')} aria-label={t('materialLabel')}
                className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-label3" />
              {isThinner(it) && <span className="text-[17px] text-label2">1 :</span>}
              <NumInput value={it.val} onChange={(v) => setItem(it.id, { val: v })} label={matName(it, t)} placeholder="0" className="w-16 text-[17px] font-semibold" />
              {!isThinner(it) && <span className="text-[17px] text-label2">%</span>}
            </div>
            <span className="pl-[34px] text-[13px] text-label2">{itemDetail(preview.items.find((x) => x.id === it.id), preview, t, fmt)}</span>
            <span aria-hidden="true" className="absolute right-0 bottom-0 left-5 h-px scale-y-50 bg-sep" />
          </div>
        ))}
        <Row last onClick={() => set({ items: [...d.items, { id: uid(), type: 'pigment', label: '', val: '' }] })} className="text-blue">
          <Icon.plusCircle /><span className="text-[17px]">{t('addMaterial')}</span>
        </Row>
      </Section>

      {ratio && (
        <Section header={<span>{t('ratioMode')}</span>}>
          <Row>
            <span className="flex-1 text-[17px]">{t('totalPct')}</span>
            <NumInput value={ratio.total} onChange={(v) => setRatio({ ...ratio, total: v })} label={t('totalPct')} placeholder="0" className="w-20 text-[17px]" />
            <span className="text-[17px] text-label2">%</span>
          </Row>
          {others.map((it) => (
            <Row key={it.id}>
              <span className="flex-1 text-[17px]">{matName(it, t)}</span>
              <span className="text-[15px] text-label2">{t('parts')}</span>
              <NumInput value={ratio.parts[it.id] || ''} onChange={(v) => setRatio({ ...ratio, parts: { ...ratio.parts, [it.id]: v } })} label={matName(it, t)} placeholder="0" className="w-16 text-[17px]" />
            </Row>
          ))}
          <Row last onClick={applyRatio} className="justify-center font-semibold text-blue">{t('apply')}</Row>
        </Section>
      )}

      {hasThinner && others.length > 0 && (
        <Section header={<span>{t('basis')}</span>}>
          <div className="p-3">
            <Segmented value={d.basis} onChange={(v) => set({ basis: v })} options={[
              { value: 'base', label: t('basisBase', { base }) },
              { value: 'baseThinner', label: t('basisMix', { base, thinner: t('type.thinner') }) },
            ]} />
          </div>
        </Section>
      )}

      {existing && (
        <Section>
          <Row last onClick={remove} className="justify-center text-red"><span className="text-[17px]">{t('deleteRecipe')}</span></Row>
        </Section>
      )}
    </Screen>
  )
}
