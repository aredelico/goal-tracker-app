import { LogIn } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="font-mono text-4xl font-bold text-white tracking-widest mb-2">
          GOAL TRACKER
        </h1>
        <p className="font-mono text-xs text-[#6b6b8a] tracking-wider">
          I'm doing it.
        </p>
      </div>

      <button
        onClick={signIn}
        className="flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-sm tracking-wider transition-all"
        style={{
          color: '#00ff88',
          border: '1px solid rgba(0,255,136,0.4)',
          background: 'rgba(0,255,136,0.08)',
          boxShadow: '0 0 20px rgba(0,255,136,0.15)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,255,136,0.16)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,255,136,0.08)'}
      >
        <LogIn size={16} />
        Sign in with Google
      </button>
    </div>
  );
}
