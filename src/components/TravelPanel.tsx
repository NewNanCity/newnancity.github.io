import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useSiteData } from '../context/SiteDataContext'
import {
  collectTravelTargets,
  filterTravelTargets,
  type TravelTargetGroup,
} from '../navigation/travel-targets.js'
import './TravelPanel.css'

const GROUPS: { id: TravelTargetGroup; label: string }[] = [
  { id: 'portal', label: '门户' },
  { id: 'town', label: '城镇' },
  { id: 'utility', label: '工具与站点' },
  { id: 'page', label: '页面来源' },
]

interface TravelPanelProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export default function TravelPanel({ open, onOpen, onClose }: TravelPanelProps) {
  const siteData = useSiteData()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const targets = useMemo(() => collectTravelTargets(siteData), [siteData])
  const filteredTargets = useMemo(
    () => filterTravelTargets(targets, query),
    [query, targets],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      setQuery('')
      dialog.showModal()
      requestAnimationFrame(() => searchRef.current?.focus())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleNativeClose = () => {
    setQuery('')
    onClose()
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const requestClose = () => dialogRef.current?.close()

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) requestClose()
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      requestClose()
      return
    }

    if (event.key !== 'Tab') return
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getClientRects().length > 0)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`nav-travel-trigger${open ? ' is-open' : ''}`}
        aria-label="打开旅行面板"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="打开旅行面板"
        onClick={onOpen}
      >
        <span aria-hidden="true">🧭</span>
      </button>

      <dialog
        ref={dialogRef}
        className="travel-dialog"
        aria-labelledby="travel-dialog-title"
        onClose={handleNativeClose}
        onKeyDown={handleDialogKeyDown}
        onMouseDown={handleBackdropMouseDown}
      >
        <div className="travel-dialog-surface" onMouseDown={(event) => event.stopPropagation()}>
          <header className="travel-dialog-header">
            <div>
              <span className="pixel-text">QUICK TRAVEL</span>
              <h2 id="travel-dialog-title">想去哪里？</h2>
            </div>
            <button
              type="button"
              className="travel-dialog-close"
              aria-label="关闭旅行面板"
              title="关闭"
              onClick={requestClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="travel-dialog-search">
            <label className="pixel-text" htmlFor="travel-search">SEARCH</label>
            <div>
              <span aria-hidden="true">⌕</span>
              <input
                ref={searchRef}
                id="travel-search"
                type="search"
                value={query}
                placeholder="搜索城镇、地图或网站"
                autoComplete="off"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <p role="status" aria-live="polite">找到 {filteredTargets.length} 个入口</p>
          </div>

          <div className="travel-dialog-body">
            {filteredTargets.length > 0 ? (
              <div className="travel-groups">
                {GROUPS.map((group) => {
                  const groupTargets = filteredTargets.filter((target) => target.group === group.id)
                  if (groupTargets.length === 0) return null
                  return (
                    <section key={group.id} className={`travel-group travel-group--${group.id}`}>
                      <h3>{group.label}</h3>
                      <ul>
                        {groupTargets.map((target) => (
                          <li key={target.id}>
                            <a
                              href={target.href}
                              target={target.destination === 'external' ? '_blank' : undefined}
                              rel={target.destination === 'external' ? 'noopener noreferrer' : undefined}
                              onClick={onClose}
                            >
                              <span className="travel-target-icon" aria-hidden="true">{target.icon}</span>
                              <span className="travel-target-copy">
                                <strong>{target.label}</strong>
                                <small>{target.description}</small>
                              </span>
                              {target.status === 'preparing' && (
                                <span className="travel-target-status">筹备中</span>
                              )}
                              <span className="travel-target-arrow" aria-hidden="true">
                                {target.destination === 'external' ? '↗' : '→'}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )
                })}
              </div>
            ) : (
              <div className="travel-empty" role="status">
                <span aria-hidden="true">◇</span>
                <strong>这条路还没有入口</strong>
                <small>换个城镇名或网站名再找找。</small>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
