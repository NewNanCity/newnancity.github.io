import { useEffect, useState } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import './Navbar.css';

export default function Navbar() {
  const { nav } = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <img src="/favicon.ico" alt="NewNanCity" className="nav-logo-img" />
          <span className="nav-logo-text">NewNanCity</span>
        </a>

        <button
          className={`nav-toggle${open ? ' active' : ''}`}
          aria-label="菜单"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        >
          <span /><span /><span />
        </button>

        <div className={`nav-links${open ? ' open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="nav-quick-grid">
            {nav.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-quick-item"
                title={l.label}
                onClick={() => setOpen(false)}
              >
                <span className="nav-quick-icon">{l.icon}</span>
                <span className="nav-quick-label">{l.label}</span>
              </a>
            ))}
          </div>
          {/* <a href="#join" className="nav-cta" onClick={() => setOpen(false)}>
            加入我们
          </a> */}
        </div>
      </div>
    </nav>
  );
}
