import { useRef, useState } from 'react'
import { useStore, uid, matName, parseNum, MATERIAL_TYPES, BASE_TYPES, COLORS, exportPayload, parseImport } from '../store.jsx'
import { kindOf, ratioToPct } from '../calc.js'
import { Screen, GlassButton, Section, Row, NumInput, PopUp, Icon, Segmented } from '../ui.jsx'
import { baseName, itemDetail, editVal, fromVal, formula, hasFixed } from '../recipe.js'

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
              <span className="truncate text-[15px] text-label2">{formula(r, t, fmt)}</span>
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
  baseLabel: r.baseLabel || '',
  groups: (r.groups || []).map((g) => ({ ...g, val: String(+(+g.ratio || 0).toFixed(4)) })),
  items: r.items.map((it) => ({ ...it, val: editVal(it) })),
})
const fromDraft = (d) => {
  const groups = d.groups.map(({ val, ...g }) => ({ ...g, ratio: parseNum(val) || 0 }))
  return {
    ...d,
    name: d.name.trim(),
    baseLabel: d.baseLabel.trim(),
    groups,
    items: d.items
      .filter((it) => !it.group || groups.some((g) => g.id === it.group))
      .map(({ val, ...it }) => ({ ...it, ...fromVal(it, val) })),
  }
}

export function EditRecipe({ nav, id, then }) {
  const { state, t, fmt, saveRecipe, deleteRecipe } = useStore()
  const existing = state.recipes.find((r) => r.id === id)
  const [d, setD] = useState(() => toDraft(existing || {
    id: uid(), name: '', color: COLORS[0], baseType: 'base', baseLabel: '', basis: 'base', groups: [],
    items: [{ id: uid(), type: 'thinner', label: '', pct: 0 }, { id: uid(), type: 'pigment', label: '', pct: 0 }],
  }))
  const [ratio, setRatio] = useState(null) // { total, parts: {id: val} }

  const set = (patch) => setD((x) => ({ ...x, ...patch }))
  const setItem = (iid, patch) => setD((x) => ({ ...x, items: x.items.map((it) => (it.id === iid ? { ...it, ...patch } : it)) }))
  const setGroup = (gid, patch) => setD((x) => ({ ...x, groups: x.groups.map((g) => (g.id === gid ? { ...g, ...patch } : g)) }))
  const removeItem = (iid) => setD((x) => ({ ...x, items: x.items.filter((it) => it.id !== iid) }))
  const addItem = (extra) => setD((x) => ({ ...x, items: [...x.items, { id: uid(), type: 'pigment', label: '', pct: 0, val: '', ...extra }] }))
  const addGroup = () => {
    const gid = uid()
    setD((x) => ({
      ...x,
      groups: [...x.groups, { id: gid, ratio: 1, val: '1' }],
      items: [...x.items,
        { id: uid(), type: 'matte', label: '', group: gid, part: 1, val: '1' },
        { id: uid(), type: 'thinner', label: '', group: gid, part: 1, val: '1' }],
    }))
  }
  const removeGroup = (gid) => setD((x) => ({ ...x, groups: x.groups.filter((g) => g.id !== gid), items: x.items.filter((it) => it.group !== gid) }))

  const preview = fromDraft(d)
  const base = baseName(preview, t)
  const loose = d.items.filter((it) => !it.group)
  const pctItems = d.items.filter((it) => kindOf(it) === 'pct')
  const showBasis = hasFixed(preview) && pctItems.length > 0

  const save = () => {
    saveRecipe(fromDraft(d))
    if (then) { nav.pop(); nav.push({ name: then, recipeId: d.id }) } else nav.pop()
  }
  const remove = () => { if (confirm(t('confirmDeleteRecipe'))) { deleteRecipe(d.id); nav.pop() } }
  const applyRatio = () => {
    const pcts = ratioToPct(pctItems.map((it) => parseNum(ratio.parts[it.id]) || 0), parseNum(ratio.total) || 0)
    setD((x) => ({ ...x, items: x.items.map((it) => {
      const i = pctItems.findIndex((o) => o.id === it.id)
      return i < 0 ? it : { ...it, val: String(+pcts[i].toFixed(4)) }
    }) }))
    setRatio(null)
  }

  const typePop = (it) => (
    <PopUp value={it.type} label={t('materials')} className="!text-label flex-none"
      onChange={(v) => setItem(it.id, { type: v })} options={MATERIAL_TYPES.map((m) => ({ value: m, label: t('type.' + m) }))} />
  )
  const labelInput = (it) => (
    <input value={it.label} onChange={(e) => setItem(it.id, { label: e.target.value })} placeholder={t('materialLabelPh')} aria-label={t('materialLabel')}
      className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-label3" />
  )
  const sep = <span aria-hidden="true" className="absolute right-0 bottom-0 left-5 h-px scale-y-50 bg-sep" />

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
          <PopUp value={d.baseType} label={t('baseType')} className="!text-label flex-none" onChange={(v) => set({ baseType: v })}
            options={BASE_TYPES.map((b) => ({ value: b, label: t('type.' + b) }))} />
          <input value={d.baseLabel} onChange={(e) => set({ baseLabel: e.target.value })} placeholder={t('baseLabelPh')} aria-label={t('baseLabel')}
            className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-label3" />
          <span className="text-[17px] text-label2">1</span>
        </Row>
      </Section>

      <div className="rounded-[26px] bg-card px-[22px] py-4">
        <div className="text-[13px] text-label2">{t('formula')}</div>
        <div className="num mt-1 text-[17px] font-semibold leading-snug break-words">{formula(preview, t, fmt)}</div>
      </div>

      <Section header={<><span>{t('materials')}</span>
        {pctItems.length > 1 && <button type="button" className="text-blue" onClick={() => setRatio(ratio ? null : { total: '', parts: {} })}>{t('ratioMode')}</button>}</>}
        footer={t('unitHint', { base })}>
        {loose.map((it) => {
          const k = kindOf(it)
          return (
            <div key={it.id} className="relative flex flex-col gap-1 px-5 py-3">
              <div className="flex items-center gap-3">
                <button type="button" aria-label={t('delete')} onClick={() => removeItem(it.id)}><Icon.minusCircle /></button>
                {typePop(it)}
                {labelInput(it)}
                {k === 'ratio' && <span className="text-[17px] text-label2">1 :</span>}
                <NumInput value={it.val} onChange={(v) => setItem(it.id, { val: v })} label={matName(it, t)} placeholder="0" className="w-16 text-[17px] font-semibold" />
                <PopUp value={k} label={t('unit')} className="flex-none !text-[15px]"
                  onChange={(v) => setItem(it.id, { mode: v })}
                  options={[{ value: 'pct', label: '%' }, { value: 'ratio', label: '1 : x' }]} />
              </div>
              <span className="pl-[34px] text-[13px] text-label2">{itemDetail(preview.items.find((x) => x.id === it.id), preview, t, fmt)}</span>
              {sep}
            </div>
          )
        })}
        <Row onClick={() => addItem()} className="text-blue">
          <Icon.plusCircle /><span className="text-[17px]">{t('addMaterial')}</span>
        </Row>
        <Row last onClick={addGroup} className="text-blue">
          <Icon.plusCircle /><span className="text-[17px]">{t('addPremix')}</span>
        </Row>
      </Section>

      {d.groups.map((g, gi) => (
        <Section key={g.id}
          header={<><span>{t('premix')} {d.groups.length > 1 ? gi + 1 : ''}</span>
            <button type="button" className="text-red" onClick={() => removeGroup(g.id)}>{t('delete')}</button></>}
          footer={t('premixHint', { base })}>
          <Row>
            <span className="flex-1 text-[17px]">{base} 1 : ({t('premix')})</span>
            <NumInput value={g.val} onChange={(v) => setGroup(g.id, { val: v })} label={t('premix')} placeholder="0" className="w-16 text-[17px] font-semibold" />
          </Row>
          {d.items.filter((it) => it.group === g.id).map((it) => (
            <div key={it.id} className="relative flex flex-col gap-1 px-5 py-3">
              <div className="flex items-center gap-3">
                <button type="button" aria-label={t('delete')} onClick={() => removeItem(it.id)}><Icon.minusCircle /></button>
                {typePop(it)}
                {labelInput(it)}
                <NumInput value={it.val} onChange={(v) => setItem(it.id, { val: v })} label={matName(it, t)} placeholder="0" className="w-16 text-[17px] font-semibold" />
                <span className="text-[15px] text-label2">{t('partWord')}</span>
              </div>
              <span className="pl-[34px] text-[13px] text-label2">{itemDetail(preview.items.find((x) => x.id === it.id), preview, t, fmt)}</span>
              {sep}
            </div>
          ))}
          <Row last onClick={() => addItem({ group: g.id, part: 1, val: '1' })} className="text-blue">
            <Icon.plusCircle /><span className="text-[17px]">{t('addMaterial')}</span>
          </Row>
        </Section>
      ))}

      {ratio && (
        <Section header={<span>{t('ratioMode')}</span>}>
          <Row>
            <span className="flex-1 text-[17px]">{t('totalPct')}</span>
            <NumInput value={ratio.total} onChange={(v) => setRatio({ ...ratio, total: v })} label={t('totalPct')} placeholder="0" className="w-20 text-[17px]" />
            <span className="text-[17px] text-label2">%</span>
          </Row>
          {pctItems.map((it) => (
            <Row key={it.id}>
              <span className="flex-1 text-[17px]">{matName(it, t)}</span>
              <span className="text-[15px] text-label2">{t('parts')}</span>
              <NumInput value={ratio.parts[it.id] || ''} onChange={(v) => setRatio({ ...ratio, parts: { ...ratio.parts, [it.id]: v } })} label={matName(it, t)} placeholder="0" className="w-16 text-[17px]" />
            </Row>
          ))}
          <Row last onClick={applyRatio} className="justify-center font-semibold text-blue">{t('apply')}</Row>
        </Section>
      )}

      {showBasis && (
        <Section header={<span>{t('basis')}</span>}>
          <div className="p-3">
            <Segmented value={d.basis} onChange={(v) => set({ basis: v })} options={[
              { value: 'base', label: t('basisBase', { base }) },
              { value: 'baseThinner', label: t('basisMix', { base }) },
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
