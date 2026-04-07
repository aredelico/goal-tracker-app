import BottomNav from './BottomNav';

// NAV_HEIGHT matches the BottomNav: py-3 (24px) + icon (20px) + gap (4px) + text (12px) ≈ 60px
const NAV_HEIGHT = 60;

export default function Layout({ active, onNavigate, children }) {
  return (
    <div className="flex flex-col min-h-dvh bg-base">
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
        }}
      >
        {children}
      </main>
      <BottomNav active={active} onChange={onNavigate} />
    </div>
  );
}
