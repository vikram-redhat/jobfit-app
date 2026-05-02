'use client';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Nav() {
  const supabase = createClient();
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_subscribed, full_name').eq('user_id', user.id).single();
      setIsPro(data?.is_subscribed ?? false);
      const name = data?.full_name?.split(' ')[0] || user.email.split('@')[0];
      setDisplayName(name);
      const emojis = ['🧑', '👩', '🧔', '👱', '👨', '🧑‍💻', '👩‍💻', '🧑‍🎨', '👩‍🎨', '🧑‍🎤'];
      const idx = user.id.charCodeAt(0) % emojis.length;
      setAvatar(emojis[idx]);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight">JobFit</span>
          {isPro && (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-blue-600 text-white rounded uppercase tracking-wide">Pro</span>
          )}
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/dashboard" className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Dashboard
        </Link>
        <Link href="/resume-for" className="hidden md:block text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Resume guides
        </Link>
        <Link href="/profile" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          {avatar && <span className="text-base leading-none">{avatar}</span>}
          {displayName && <span className="hidden sm:inline font-medium">{displayName}</span>}
        </Link>
        <Link
          href="/dashboard?new=1"
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + New Job
        </Link>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 font-mono transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}
