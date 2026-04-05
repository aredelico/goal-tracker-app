export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      className="fixed top-4 left-1/2 z-[200] px-4 py-2 rounded-lg font-mono text-sm pointer-events-none toast-enter"
      style={{
        transform: 'translateX(-50%)',
        color: toast.color,
        background: 'rgba(18, 18, 26, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${toast.color}44`,
        boxShadow: `0 0 20px ${toast.color}33`,
      }}
    >
      {toast.message}
    </div>
  );
}
