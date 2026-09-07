import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  LayoutDashboard, MapPin, ClipboardList, Camera, Volume2, BookOpen,
  TrendingUp, BarChart3, TreePine, HeartPulse, ShieldCheck,
  Map, FileBarChart, Users, Eye, LogOut, ChevronLeft, ChevronRight,
  PawPrint, Sparkles, Activity
} from 'lucide-react';

const ROLE_LABELS = {
  wildlife_researcher: 'Wildlife Researcher',
  conservation_officer: 'Conservation Officer',
  forest_department_officer: 'Forest Officer',
  administrator: 'System Admin',
};

const ALL_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
  { to: '/monitoring-sites', label: 'Monitoring Sites', icon: MapPin, roles: ['all'] },
  { to: '/surveys', label: 'Field Surveys', icon: ClipboardList, roles: ['all'] },
  { to: '/observations', label: 'Observations', icon: Eye, roles: ['all'] },
  { divider: true, label: 'AI Detection Suite', roles: ['all'] },
  { to: '/image-analysis', label: 'Computer Vision', icon: Camera, roles: ['all'], badge: 'AI' },
  { to: '/audio-analysis', label: 'Bioacoustics', icon: Volume2, roles: ['all'], badge: 'AI' },
  { divider: true, label: 'Ecological Intel', roles: ['all'] },
  { to: '/species-catalog', label: 'Species Catalog', icon: BookOpen, roles: ['all'] },
  { to: '/population', label: 'Population Intel', icon: TrendingUp, roles: ['all'] },
  { to: '/biodiversity', label: 'Biodiversity Index', icon: BarChart3, roles: ['all'] },
  { to: '/habitat', label: 'Habitat Suitability', icon: TreePine, roles: ['all'] },
  { to: '/ecosystem-health', label: 'Ecosystem Health', icon: HeartPulse, roles: ['all'] },
  { divider: true, label: 'Operations & Maps', roles: ['all'] },
  { to: '/conservation', label: 'Conservation Hub', icon: ShieldCheck, roles: ['all'] },
  { to: '/gis-map', label: 'GIS Live Map', icon: Map, roles: ['all'] },
  { to: '/reports', label: 'Analytics Reports', icon: FileBarChart, roles: ['all'] },
  { divider: true, label: 'Administration', roles: ['administrator'] },
  { to: '/admin/users', label: 'User Management', icon: Users, roles: ['administrator'] },
];

export default function Sidebar({ user, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = user?.role || 'wildlife_researcher';

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const visibleNav = ALL_NAV.filter((item) => {
    if (item.roles?.includes('all')) return true;
    if (item.roles?.includes(userRole)) return true;
    return false;
  });

  return (
    <aside
      className={`relative flex flex-col h-full bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 text-white transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Collapse Button */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-6 z-40 h-7 w-7 bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-slate-800/70 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center">
          <div className="h-full w-full bg-slate-950/40 rounded-[10px] flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-emerald-300" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                BioSphere AI
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 truncate">Wildlife Intelligence</p>
          </div>
        )}
      </div>

      {/* User Info Card */}
      {!collapsed && user && (
        <div className="mx-3 my-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-inner">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-md">
            {user.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-100 truncate">{user.full_name || 'User'}</p>
            <p className="text-[10px] font-medium text-emerald-400 truncate flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-none">
        {visibleNav.map((item, idx) => {
          if (item.divider) {
            return !collapsed ? (
              <div key={idx} className="pt-4 pb-1.5 px-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {item.label}
                </p>
              </div>
            ) : (
              <div key={idx} className="border-t border-slate-800/80 my-2 mx-2" />
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  collapsed ? 'h-5 w-5' : ''
                }`}
              />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800/70 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              AI Core Online
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all w-full cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
