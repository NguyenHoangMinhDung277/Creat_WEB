import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Menu,
  X,
  Layers,
  FileText,
  Brain,
  History,
  GraduationCap
} from 'lucide-react';
import RainbowBorder from '../common/RainbowBorder';

export default function Navbar({
  activeTab,
  setActiveTab,
  uiLang,
  setUiLang,
  theme,
  setTheme,
  isMuted,
  toggleMute,
  streak,
  xp,
  hasApiKey,
  onOpenSettings,
  t
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'levels', label: t.navLevels, icon: Layers },
    { id: 'extract', label: t.navExtract, icon: FileText },
    { id: 'practice', label: t.navPractice, icon: Brain },
    { id: 'history', label: t.navHistory, icon: History },
    { id: 'placement', label: t.navPlacement, icon: GraduationCap },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-3 sm:px-6">
      <RainbowBorder
        thickness={2}
        rounded="rounded-2xl"
        className="max-w-7xl mx-auto shadow-2xl"
        innerClassName="px-4 py-3 flex items-center justify-between"
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleTabClick('levels')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-neon-cyan group-hover:scale-105 transition-transform">
            <span className="text-xl">🌊</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-300 via-white to-blue-200 bg-clip-text text-transparent">
                AuraLingua
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                AI
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-cyan-200/70 font-medium">
              {uiLang === 'vi' ? 'Tiếng Anh chuẩn xác cho người Việt' : 'English mastery for Vietnamese speakers'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Pills & Controls */}
        <div className="flex items-center gap-2">
          {/* Streak Counter */}
          <div
            title={`${streak} ${t.streakDay}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold"
          >
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{streak}</span>
          </div>

          {/* XP Badge */}
          <div
            title={`${xp} ${t.totalXP}`}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{xp} XP</span>
          </div>

          {/* Demo Mode / Live Mode Badge */}
          <button
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
              hasApiKey
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`} />
            <span>{hasApiKey ? t.liveMode : t.demoMode}</span>
          </button>

          {/* Language Toggle EN / VI */}
          <button
            onClick={() => setUiLang(prev => (prev === 'en' ? 'vi' : 'en'))}
            className="px-2 py-1 rounded-xl text-xs font-bold border border-white/10 hover:border-cyan-400/50 bg-white/5 text-slate-200 transition-colors"
            title="Switch UI Language / Đổi ngôn ngữ giao diện"
            aria-label="Toggle UI language"
          >
            {uiLang === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
            className="p-1.5 rounded-xl border border-white/10 hover:border-cyan-400/50 bg-white/5 text-slate-300 hover:text-white transition-colors"
            title={theme === 'dark' ? t.lightTheme : t.darkTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-500" />}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-xl border border-white/10 hover:border-cyan-400/50 bg-white/5 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? t.unmuteSound : t.muteSound}
            aria-label="Toggle sound effects"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl border border-white/10 hover:border-cyan-400/50 bg-white/5 text-slate-300 hover:text-white transition-colors"
            title={t.settings}
            aria-label="Open settings"
          >
            <SettingsIcon className="w-4 h-4 text-slate-200 hover:rotate-45 transition-transform" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </RainbowBorder>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-3 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
