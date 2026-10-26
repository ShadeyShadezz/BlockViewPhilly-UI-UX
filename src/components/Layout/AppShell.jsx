import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/map-overview', label: 'Map overview / 2D' },
  { to: '/map', label: '3D Map' },
  { to: '/location', label: 'Location' },
  { to: '/resources', label: 'Resources & Sources' },
  { to: '/settings', label: 'Settings' },
];

export default function AppShell() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('blockview-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } });

  // Apply the theme to body-mounted dialogs and expanded 3D panels as well.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const currentSection = navItems.find((item) => item.to === location.pathname)?.label ?? 'Overview';

  const toggleTheme = () => setTheme(previous => { const next = previous === 'light' ? 'dark' : 'light'; try { localStorage.setItem('blockview-theme', next); } catch {} return next; });

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">BlockView</span>
          <span className="brand-subtitle">Philadelphia explorer</span>
        </div>

        <div className="site-purpose">
          Philadelphia, connected. Places, maps and public data.
        </div>

        <button className="theme-toggle" type="button" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </header>

      <div className="content-grid">
        <aside className="left-rail">
          <div className="rail-section orange">
            <div className="rail-label">Navigation</div>
            <div className="rail-label">Sections</div>
          </div>

          <nav className="side-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => (isActive ? 'side-nav-link active' : 'side-nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

        </aside>

        <main className="page-panel">
          <Outlet context={{ theme, toggleTheme }} />
        </main>
      </div>

      <footer className="compact-footer"><span>BlockView Philly - Place and data explorer</span><NavLink to="/resources">Data provenance &gt;</NavLink></footer>
    </div>
  );
}
