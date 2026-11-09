import { motion } from 'motion/react'

/* ---------- 아이콘 (SF Symbols 느낌의 단순 도형) ---------- */
export const Icon = {
  back: (p) => <svg aria-hidden="true" width="11" height="19" viewBox="0 0 11 19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.5 1.5l-8 8 8 8" /></svg>,
  chevron: (p) => <svg aria-hidden="true" width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 1l6 6-6 6" /></svg>,
  updown: (p) => <svg aria-hidden="true" width="9" height="14" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 6l3-3 3 3M2 10l3 3 3-3" /></svg>,
  plus: (p) => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14" /></svg>,
  plusCircle: (p) => <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" fill="var(--green)" /><path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  minusCircle: (p) => <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" fill="var(--red)" /><path d="M7 12h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  check: (p) => <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2.5 7.5l3 3 6-7" /></svg>,
  globe: (p) => <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>,
  flask: (p) => <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M9 2h6v2h-1v5.2l5.6 9.7A2 2 0 0 1 17.9 22H6.1a2 2 0 0 1-1.7-3.1L10 9.2V4H9z" /></svg>,
  scale: (p) => <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 20h14M12 4v16M4 8h16M4 8l-2.5 6a3 3 0 0 0 5 0zM20 8l-2.5 6a3 3 0 0 0 5 0z" /></svg>,
  list: (p) => <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm4 3v2h8V8zm0 5v2h5v-2z" /></svg>,
  pie: (p) => <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11 2.05A10 10 0 1 0 21.95 13H11z" /><path d="M13 2.05V11h8.95A10 10 0 0 0 13 2.05z" opacity="0.55" /></svg>,
  trash: (p) => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg>,
  share: (p) => <svg aria-hidden="true" width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 14V2M4.5 6L9 1.5 13.5 6" /><path d="M6 9H3v11h12V9h-3" /></svg>,
  download: (p) => <svg aria-hidden="true" width="18" height="22" viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 2v12M4.5 9.5L9 14l4.5-4.5" /><path d="M3 18h12" /></svg>,
}

/* ---------- 화면 틀: 상단 떠 있는 버튼 + 스크롤 영역 ---------- */
export function Screen({ title, subtitle, large, left, right, children, bottom, tabBar = true }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="pt-safe mx-auto w-full max-w-[560px] px-4" style={{ paddingBottom: bottom ? 120 : tabBar ? 120 : 40 }}>
          <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-3" style={{ background: 'linear-gradient(to bottom, var(--bg) 60%, transparent)' }}>
            <div className="flex h-11 items-center justify-between gap-2">
              <div className="flex min-w-11 gap-2">{left}</div>
              {!large && (
                <div className="flex min-w-0 flex-col items-center text-center">
                  <span className="truncate text-[17px] font-semibold">{title}</span>
                  {subtitle && <span className="truncate text-[12px] text-label2">{subtitle}</span>}
                </div>
              )}
              <div className="flex min-w-11 justify-end gap-2">{right}</div>
            </div>
          </div>
          {large && <h1 className="mx-1 mb-4 -mt-1 text-[34px] font-bold tracking-tight">{title}</h1>}
          <div className="flex flex-col gap-[22px]">{children}</div>
        </div>
      </div>
      {bottom && <div className="pb-safe pointer-events-none absolute inset-x-0 bottom-0 px-4"><div className="pointer-events-auto mx-auto max-w-[560px] pb-3">{bottom}</div></div>}
    </div>
  )
}

export function GlassButton({ label, onClick, children, className = '', ...rest }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className={`glass flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[17px] active:scale-95 transition-transform ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Section({ header, footer, children, className = '' }) {
  return (
    <section className="flex flex-col gap-[7px]">
      {header && <div className="flex justify-between px-4 text-[13px] text-label2">{header}</div>}
      <div className={`overflow-hidden rounded-[26px] bg-card ${className}`}>{children}</div>
      {footer && <p className="m-0 px-4 text-[13px] leading-snug text-label2">{footer}</p>}
    </section>
  )
}

export function Row({ children, onClick, last, className = '', as }) {
  const Tag = as || (onClick ? 'button' : 'div')
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick}
      className={`relative flex min-h-[52px] w-full items-center gap-3 px-5 text-left ${onClick ? 'active:bg-fill' : ''} ${className}`}>
      {children}
      {!last && <span aria-hidden="true" className="absolute right-0 bottom-0 left-5 h-px origin-bottom scale-y-50 bg-sep" />}
    </Tag>
  )
}

export function Dot({ color, size = 12 }) {
  return <span aria-hidden="true" className="flex-none rounded-full" style={{ width: size, height: size, background: color, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)' }} />
}

/** 숫자 입력: 쉼표 소수점 허용, 숫자 키패드 */
export function NumInput({ value, onChange, className = '', label, placeholder, autoFocus }) {
  return (
    <input type="text" inputMode="decimal" enterKeyHint="done" autoComplete="off" aria-label={label}
      value={value} placeholder={placeholder} autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
      onFocus={(e) => e.target.select()}
      className={`num min-w-0 bg-transparent text-right outline-none placeholder:text-label3 focus:text-blue ${className}`} />
  )
}

/** HIG 팝업 버튼: 현재 값 + ⌃⌄, 누르면 시스템 메뉴 */
export function PopUp({ value, options, onChange, label, className = '' }) {
  const cur = options.find((o) => o.value === value)
  return (
    <label className={`relative flex items-center gap-1.5 text-[17px] text-label2 ${className}`}>
      <span className="truncate">{cur?.label}</span>
      <Icon.updown />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function Segmented({ value, options, onChange }) {
  return (
    <div className="grid h-[34px] rounded-full bg-fill p-[3px]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className="relative rounded-full text-[13px] font-semibold">
          {value === o.value && <motion.span layoutId={'seg-' + options.map((x) => x.value).join()} className="absolute inset-0 rounded-full bg-segon shadow-[0_2px_8px_rgba(0,0,0,0.12)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function CheckCircle({ on }) {
  return (
    <motion.span aria-hidden="true" className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
      animate={{ backgroundColor: on ? 'var(--green)' : 'rgba(0,0,0,0)', scale: on ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 0.25 }} style={{ boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--label3)' }}>
      {on && <Icon.check />}
    </motion.span>
  )
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex h-[54px] w-full items-center justify-center rounded-full text-[17px] font-semibold transition active:scale-[0.98] ${disabled ? 'bg-fill text-label3' : 'bg-blue text-white shadow-[0_6px_20px_rgba(0,122,255,0.35)]'}`}>
      {children}
    </button>
  )
}

/** 큰 숫자 히어로 */
export function Hero({ label, value, unit, sub }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1 text-center">
      <span className="text-[15px] text-label2">{label}</span>
      <motion.span key={value} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="num text-[52px] leading-[1.05] font-bold tracking-tight">
        {value}<span className="text-[26px] font-semibold text-label2"> {unit}</span>
      </motion.span>
      {sub && <span className="text-[15px] text-label2">{sub}</span>}
    </div>
  )
}
