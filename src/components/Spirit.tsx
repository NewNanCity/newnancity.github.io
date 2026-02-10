import { useRef, useEffect, useState } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import './Spirit.css';

export default function Spirit() {
  const { spirit } = useSiteData();
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="spirit" className="section spirit-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-tag pixel-text">SPIRIT</span>
          <h2 className="section-title">牛腩精神</h2>
          <div className="section-line" />
        </div>

        <blockquote
          ref={quoteRef}
          className={`spirit-quote animate-on-scroll${visible ? ' spirit-quote--visible' : ''}`}
        >
          <span className="spirit-quote-mark">"</span>
          {spirit.quote}
          <span className="spirit-quote-mark">"</span>
        </blockquote>

        <div className="spirit-values">
          {spirit.values.map((v, i) => (
            <div
              key={i}
              className="spirit-card animate-on-scroll"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <span className="spirit-card-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
