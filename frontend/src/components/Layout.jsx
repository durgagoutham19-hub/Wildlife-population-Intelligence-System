import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Menu, Sparkles, ShieldCheck, Activity, Search, LogOut, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../App';
import { apiFetch } from '../utils/api';

const PAGE_TITLES = {
  '/dashboard': { title: 'Intelligence Dashboard', subtitle: 'Overview of ecological metrics & AI telemetry' },
  '/monitoring-sites': { title: 'Monitoring Sites', subtitle: 'Geo-fenced sanctuaries, camera clusters & sensor grids' },
  '/surveys': { title: 'Field Surveys', subtitle: 'Transects, camera trap runs & telemetry logs' },
  '/observations': { title: 'Observations Database', subtitle: 'Verified animal sightings & occurrence logs' },
  '/image-analysis': { title: 'Computer Vision Sighting Lab', subtitle: 'YOLOv8 automated camera trap species detection' },
  '/audio-analysis': { title: 'Bioacoustic Spectral Analyzer', subtitle: 'Spectrogram acoustic pattern recognition' },
  '/species-catalog': { title: 'Taxonomic Species Catalog', subtitle: 'IUCN conservation statuses & ecological niches' },
  '/population': { title: 'Population Intelligence', subtitle: 'Mark-recapture density estimations & demography' },
  '/biodiversity': { title: 'Biodiversity Index', subtitle: 'Shannon-Wiener, Simpson & species richness analytics' },
  '/habitat': { title: 'Habitat Suitability Model', subtitle: 'MaxEnt ecological niche & canopy density analysis' },
  '/ecosystem-health': { title: 'Ecosystem Vitality Index', subtitle: 'Trophic equilibrium & environmental pressure metrics' },
  '/conservation': { title: 'Conservation Action Hub', subtitle: 'Poaching risk alerts & habitat restoration directives' },
  '/gis-map': { title: 'Geospatial GIS Map', subtitle: 'Live coordinate plotting & telemetry heatmaps' },
  '/reports': { title: 'Analytics & Compliance Reports', subtitle: 'Exportable wildlife census & biodiversity dossiers' },
  '/admin/users': { title: 'Access Control & Users', subtitle: 'Role-based credentials & system provisioning' },
};

export default function Layout({ user, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [systemHealthy, setSystemHealthy] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const currentRouteInfo = PAGE_TITLES[location.pathname] || {
    title: 'Wildlife Intelligence',
    subtitle: 'AI Conservation & Population Analytics'
  };

  useEffect(() => {
    async function checkHealthAndAlerts() {
      const res = await apiFetch('/api/v1/conservation/alerts?is_active=true');
      if (res.ok && Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    }
    checkHealthAndAlerts();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full shrink-0 shadow-2xl z-20">
        <Sidebar user={user} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 shadow-2xl">
            <Sidebar user={user} collapsed={false} setCollapsed={() => {}} />
          </div>
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                {currentRouteInfo.title}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {currentRouteInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions & User Bar */}
          <div className="flex items-center gap-3">
            {/* Live System Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Backend Connected</span>
            </div>

            {/* Quick AI Action button */}
            <Link
              to="/image-analysis"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Sightings Lab</span>
            </Link>

            {/* Notification Drawer Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:bg-slate-750 text-slate-300 hover:text-white transition-all"
                title="Active Alerts"
              >
                <Bell className="h-4 w-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-4 divide-y divide-slate-800">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Conservation Alerts</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full">
                      {alerts.length} Active
                    </span>
                  </div>

                  <div className="py-2 max-h-60 overflow-y-auto space-y-2">
                    {alerts.length > 0 ? (
                      alerts.slice(0, 5).map((alt) => (
                        <div key={alt.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-400">{alt.alert_type}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-500">{alt.severity}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">{alt.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">No active conservation alerts.</p>
                    )}
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      to="/conservation"
                      onClick={() => setNotificationOpen(false)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      View All in Conservation Hub &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with dropdown preview */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-xs font-black shadow-md">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.full_name || 'Officer'}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
