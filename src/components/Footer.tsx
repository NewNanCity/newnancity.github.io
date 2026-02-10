import { useSiteData } from '../context/SiteDataContext';
import './Footer.css';

const year = new Date().getFullYear();

export default function Footer() {
  const { footer } = useSiteData();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/favicon.ico" alt="牛腩小镇" className="footer-logo" />
          <span className="footer-name">NewNanCity</span>
          <p className="footer-tagline">{footer.tagline}</p>
        </div>

        <div className="footer-col">
          <h4>快捷链接</h4>
          <ul>
            {footer.quickLinks.map((l, i) => (
              <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>社交平台</h4>
          <ul>
            {footer.socialLinks.map((l, i) => (
              <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>关注我们</h4>
          <a
            href={footer.follow.url}
            className="footer-follow-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            {footer.follow.label}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2020–{year} 牛腩小镇 NewNanCity. All rights reserved.</p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icp"
        >
          {footer.icp}
        </a>
      </div>
    </footer>
  );
}
