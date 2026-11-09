import { useMemo, useRef, useState } from 'react'
import { useStore, uid, matName, COLORS, exportPayload, parseImport } from '../store.jsx'
import { baseName, formula } from '../recipe.js'
import { parse, serialize, shortName, expandName, tokenize } from '../formula.js'
import { Screen, GlassButton, Section, Row, Icon } from '../ui.jsx'
import { Lines, valsOf } from './Work.jsx'

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
      right={<GlassButton label={t('newRecipe')} onClick={() => nav.push({ name: 'build' })}><Icon.plus /></GlassButton>}>
      <Section footer={state.recipes.length === 0 ? t('noRecipes') : null}>
        {state.recipes.map((r) => (
          <Row key={r.id} className="min-h-[60px]" onClick={() => nav.push({ name: 'build', id: r.id })}>
            <span className="h-[30px] w-[30px] flex-none rounded-lg" style={{ background: r.color, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)' }} />
            <span className="flex min-w-0 flex-1 flex-col py-2.5">
              <span className="truncate text-[17px]">{r.name || baseName(r, t)}</span>
              <span className="truncate text-[15px] text-label2">{formula(r, t, fmt)}</span>
            </span>
            <Icon.chevron className="text-label3" />
          </Row>
        ))}
        <Row last onClick={() => nav.push({ name: 'build' })} className="text-blue"><Icon.plusCircle /><span className="text-[17px]">{t('newRecipe')}</span></Row>
      </Section>

      <Section footer={msg || t('shareHint')}>
        <Row onClick={doExport} className="text-blue"><Icon.share /><span className="text-[17px]">{t('exportAll')}</span></Row>
        <Row last onClick={() => fileRef.current?.click()} className="text-blue"><Icon.download /><span className="text-[17px]">{t('importAll')}</span></Row>
      </Section>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
    </Screen>
  )
}

/* ---------- 표기 편집 (키패드 입력) ---------- */
const lastTok = (s) => { const k = tokenize(s); return k[k.length - 1] }
const isNumTok = (w) => /^\d+(?:[.,]\d*)?$/.test(w || '')
const valueEnded = (s) => { const w = lastTok(s); return isNumTok(w) || w === ')' || w === '%' }
const openGroup = (s) => (s.match(/\(/g) || []).length > (s.match(/\)/g) || []).length

function insName(s, label) {
  let x = s.trimEnd()
  if (!x) return label + ' '
  if (valueEnded(x)) x += ' :'
  return `${x} ${label} `
}
function insDigit(s, d) {
  if (/\s$/.test(s) || !s) return s + d
  const w = lastTok(s)
  if (isNumTok(w)) return s + d
  return s + ' ' + d
}
function backspace(s) {
  const x = s.trimEnd()
  const w = lastTok(x)
  if (!w) return ''
  if (isNumTok(w)) return x.slice(0, -1)
  return x.slice(0, x.length - w.length).trimEnd() + (x.length - w.length > 0 ? ' ' : '')
}

export function Build({ nav, id, then }) {
  const { state, t, saveRecipe, deleteRecipe } = useStore()
  const existing = state.recipes.find((r) => r.id === id)
  const [name, setName] = useState(existing?.name || '')
  const [text, setText] = useState(() => (existing ? serialize(existing, baseName(existing, t), (it) => matName(it, t)) : ''))
  const [code, setCode] = useState(null) // 새 재료 번호 입력 중
  const [pasting, setPasting] = useState(false)
  const parsed = useMemo(() => parse(text, existing), [text, existing])
  const ok = !!parsed.recipe

  // 재료 버튼: 저장된 배합에 나온 이름, 많이 쓴 순
  const chips = useMemo(() => {
    const n = new Map()
    for (const r of state.recipes) for (const l of [r.baseLabel, ...r.items.map((it) => it.label)]) {
      const k = (l || '').trim(); if (k) n.set(k, (n.get(k) || 0) + 1)
    }
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 24)
  }, [state.recipes])

  const save = () => {
    if (!ok) return
    const r = { ...(existing || { color: COLORS[0] }), ...parsed.recipe, id: existing?.id || uid(), name: name.trim() || parsed.recipe.baseLabel }
    saveRecipe(r)
    if (then) { nav.pop(); nav.push({ name: then, recipeId: r.id }) } else nav.pop()
  }
  const remove = () => { if (confirm(t('confirmDeleteRecipe'))) { deleteRecipe(existing.id); nav.pop() } }
  const paste = async () => {
    try { const s = await navigator.clipboard.readText(); if (s.trim()) { setText(s.trim()); return } } catch { /* 권한 없음 */ }
    setPasting(true)
  }

  const key = (label, onClick, cls = '', aria) => (
    <button type="button" aria-label={aria} onClick={onClick}
      className={`flex h-[46px] items-center justify-center rounded-[6px] text-[25px] active:bg-[#c0c3ca] ${cls}`}>{label}</button>
  )
  const pill = (label, onClick, cls = '') => (
    <button type="button" onClick={onClick} className={`h-9 flex-none rounded-full px-3.5 text-[15px] font-semibold active:scale-95 ${cls}`}>{label}</button>
  )
  const digit = (d) => (code != null ? setCode(code + d) : setText(insDigit(text, d)))
  const pickSuffix = (suf) => { if (code) setText(insName(text, expandName(code + suf))); setCode(null) }

  return (
    <div className="absolute inset-0">
      <Screen title={existing ? name || parsed.recipe?.baseLabel || t('newRecipe') : t('newRecipe')} tabBar={false} pad={400}
        left={<GlassButton label={t('cancel')} onClick={nav.pop}><Icon.close /></GlassButton>}
        right={<button type="button" aria-label={t('done')} onClick={save} disabled={!ok}
          className={`flex h-11 w-11 items-center justify-center rounded-full ${ok ? 'bg-blue text-white' : 'bg-fill text-label3'}`}><Icon.done /></button>}>

        <Section>
          <Row last>
            <span className="w-20 flex-none text-[17px]">{t('recipeName')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={parsed.recipe?.baseLabel || t('recipeNamePh')} aria-label={t('recipeName')}
              className="min-w-0 flex-1 bg-transparent text-right text-[17px] outline-none placeholder:text-label3" />
          </Row>
        </Section>

        <Section footer={<span className={ok || !text ? '' : 'text-red'}>{text ? (ok ? text : t('parseErr') + ' · ' + text) : t('formulaHint')}</span>}>
          {ok ? <Lines recipe={parsed.recipe} vals={valsOf(parsed.recipe)} /> : (
            <Row last><span className="num min-h-[24px] flex-1 break-all text-[17px]">{text}<span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-blue" /></span></Row>
          )}
        </Section>

        <Section footer={t('pasteHint')}>
          {pasting ? (
            <textarea autoFocus rows={3} placeholder={t('pasteMemo')} aria-label={t('pasteMemo')}
              onChange={(e) => setText(e.target.value)} onBlur={() => setPasting(false)}
              className="block w-full resize-none bg-transparent px-5 py-3 text-[17px] outline-none" />
          ) : (
            <Row last onClick={paste} className="text-blue"><Icon.paste /><span className="text-[17px]">{t('pasteMemo')}</span></Row>
          )}
        </Section>

        {existing && (
          <Section><Row last onClick={remove} className="justify-center text-red"><span className="text-[17px]">{t('deleteRecipe')}</span></Row></Section>
        )}
      </Screen>

      <div className="absolute inset-x-0 bottom-0 z-30 bg-[#d1d3d9] text-black dark:bg-[#2c2c2e] dark:text-white">
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-black/10 bg-white/70 px-2 py-1.5 dark:bg-white/5">
          {code != null ? (
            <>
              <span className="num flex h-9 flex-none items-center px-2 text-[17px] font-semibold">{code || t('newMatHint')}</span>
              {code && ['무', '유', '신'].map((s) => pill(s === '무' ? code + '무광' : s === '유' ? code + '유광' : code + '신나', () => pickSuffix(s), 'bg-white dark:bg-white/15'))}
              {code && pill(code, () => pickSuffix(''), 'bg-white dark:bg-white/15')}
              {pill(t('cancel'), () => setCode(null), 'text-blue')}
            </>
          ) : (
            <>
              {chips.map((c) => pill(shortName(c), () => setText(insName(text, c)), 'bg-white dark:bg-white/15'))}
              {pill('+ ' + t('newMaterial'), () => setCode(''), 'border border-dashed border-black/30 dark:border-white/30')}
            </>
          )}
        </div>
        <div className="flex gap-2 bg-white/70 px-2 pt-1.5 pb-2 dark:bg-white/5">
          {pill(openGroup(text) ? ')' : '(', () => setText(openGroup(text) ? text.trimEnd() + ') ' : (valueEnded(text) ? text.trimEnd() + ' : (' : text + '(')), 'flex-1 bg-black/10 dark:bg-white/15')}
          {pill(':', () => setText(text.trimEnd() + ' : '), 'flex-1 bg-black/10 dark:bg-white/15')}
          {pill('+', () => setText(text.trimEnd() + ' + '), 'flex-1 bg-black/10 dark:bg-white/15')}
          {pill('%', () => setText(text.trimEnd() + '%'), 'flex-1 bg-black/10 dark:bg-white/15')}
        </div>
        <div className="pb-safe grid grid-cols-3 gap-1.5 px-1.5 pt-1.5" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <span key={d} className="contents">{key(d, () => digit(d), 'bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)] dark:bg-white/25')}</span>)}
          {key('.', () => (code == null && setText(insDigit(text, '.'))), '')}
          {key('0', () => digit('0'), 'bg-white shadow-[0_1px_0_rgba(0,0,0,0.3)] dark:bg-white/25')}
          {key(<Icon.del />, () => (code != null ? setCode(code.slice(0, -1)) : setText(backspace(text))), '', t('delete'))}
        </div>
      </div>
    </div>
  )
}
