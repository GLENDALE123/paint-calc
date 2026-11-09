import { useStore, uid, parseNum } from '../store.jsx'
import { shares } from '../calc.js'
import { Screen, GlassButton, Section, Row, NumInput, Icon, Hero } from '../ui.jsx'

export function Defects() {
  const { state, t, fmt, setDefects } = useStore()
  const d = state.defects
  const total = parseNum(d.total)
  const counts = d.rows.map((r) => parseNum(r.count) || 0)
  const s = shares(total > 0 ? total : 0, counts)
  const setRow = (id, patch) => setDefects({ ...d, rows: d.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) })

  return (
    <Screen large title={t('tabDefects')}
      right={<GlassButton label={t('reset')} onClick={() => setDefects({ total: '', rows: [{ id: uid(), name: '', count: '' }] })}>{t('reset')}</GlassButton>}>
      <Hero label={t('defectRate')} value={total > 0 ? fmt.num(s.pct, 2) : '–'} unit="%"
        sub={total > 0 ? t('ofTotal', { n: fmt.num(total, 0), m: fmt.num(s.sum, 0) }) : ' '} />

      <Section footer={s.over ? <span className="text-red">{t('overWarn')}</span> : t('defectHint')}>
        <Row>
          <span className="flex-1 text-[17px]">{t('totalQty')}</span>
          <NumInput value={d.total} onChange={(v) => setDefects({ ...d, total: v })} label={t('totalQty')} placeholder="0" className="w-28 text-[17px] font-semibold" />
        </Row>
        {d.rows.map((r, i) => (
          <div key={r.id} className="relative flex flex-col gap-2 px-5 py-3">
            <div className="flex items-center gap-3">
              <button type="button" aria-label={t('delete')} onClick={() => setDefects({ ...d, rows: d.rows.filter((x) => x.id !== r.id) })}><Icon.minusCircle /></button>
              <input value={r.name} onChange={(e) => setRow(r.id, { name: e.target.value })} placeholder={`${t('itemPh')} ${i + 1}`} aria-label={t('itemPh')}
                className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-label3" />
              <NumInput value={r.count} onChange={(v) => setRow(r.id, { count: v })} label={t('count')} placeholder={t('count')} className="w-16 text-[17px]" />
              <span className="num w-[64px] text-right text-[17px] font-semibold">{total > 0 ? fmt.num(s.rows[i], 2) + '%' : '–'}</span>
            </div>
            <div className="ml-[34px] h-1.5 overflow-hidden rounded-full bg-fill">
              <div className="h-full rounded-full bg-blue transition-[width] duration-300" style={{ width: s.sum > 0 ? `${(counts[i] / s.sum) * 100}%` : 0 }} />
            </div>
            <span aria-hidden="true" className="absolute right-0 bottom-0 left-5 h-px scale-y-50 bg-sep" />
          </div>
        ))}
        <Row last onClick={() => setDefects({ ...d, rows: [...d.rows, { id: uid(), name: '', count: '' }] })} className="text-blue">
          <Icon.plusCircle /><span className="text-[17px]">{t('addItem')}</span>
        </Row>
      </Section>
    </Screen>
  )
}
