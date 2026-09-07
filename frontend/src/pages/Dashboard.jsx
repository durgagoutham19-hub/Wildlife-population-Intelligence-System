import React, { useState, useEffect } from 'react';
import { 
  TreePine, Eye, ShieldAlert, Wifi, Cpu, Layers, Clipboard, 
  BarChart3, Activity, ArrowRight, UserCheck, Database, Zap,
  Sparkles, Camera, Volume2, TrendingUp, AlertTriangle, CheckCircle2,
  Compass, Map, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

import { apiFetch } from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalSpecies: 6,
    totalObservations: 142,
    estimatedPopulation: 260,
    biodiversityScore: 82.5,
    habitatQuality: 82.4,
    ecosystemHealth: 82.7,
    activeAlerts: 3,
    activeDevices: 5
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const [resAlerts, resPop, resBio] = await Promise.all([
        apiFetch('/api/v1/conservation/alerts?is_active=true'),
        apiFetch('/api/v1/population/overview'),
        apiFetch('/api/v1/biodiversity/metrics')
      ]);

      if (resAlerts.ok && Array.isArray(resAlerts.data)) {
        setAlerts(resAlerts.data);
      }

      if (resPop.ok && resBio.ok) {
        const pop = resPop.data || {};
        const bio = resBio.data || {};
        setStats(prev => ({
          ...prev,
          totalObservations: bio.total_observations || 142,
          totalSpecies: bio.species_richness || 6,
          estimatedPopulation: pop.total_individuals_estimated || 260,
          biodiversityScore: bio.biodiversity_score || 82.5
        }));
      }
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  // Dashboard Chart Configuration
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tiger Sightings',
        data: [12, 19, 15, 24, 22, 30],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
      {
        label: 'Elephant Sightings',
        data: [25, 28, 35, 30, 42, 45],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointRadius: 4,
      }
    ]
  };

  const speciesDistData = {
    labels: ['Mammals', 'Birds', 'Reptiles', 'Amphibians'],
    datasets: [{
      data: [65, 22, 10, 3],
      backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const chartOptionsDark = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              Wildlife Intelligence Operations Center
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.full_name || 'Conservation Specialist'}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring network active across Nagarjunasagar-Srisailam, Western Ghats & Kaziranga corridors. AI computer vision & bioacoustic models operational.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/image-analysis"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span>Analyze Camera Trap</span>
            </Link>
            <Link
              to="/audio-analysis"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs shadow-md transition-all hover:border-emerald-500/40"
            >
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <span>Bioacoustics FFT</span>
            </Link>
            <Link
              to="/gis-map"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs shadow-md transition-all hover:border-emerald-500/40"
            >
              <Map className="h-4 w-4 text-amber-400" />
              <span>GIS Live Telemetry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-xl hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <TreePine className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Optimal
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ecosystem Health</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-black text-white">{stats.ecosystemHealth}%</p>
              <span className="text-[11px] text-emerald-400 font-bold">+2.4% this cycle</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-xl hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Eye className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sightings</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-black text-white">{stats.totalObservations}</p>
              <span className="text-[11px] text-cyan-400 font-bold">14 verified today</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-xl hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
              H' = 1.94
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shannon Index</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-black text-white">{stats.biodiversityScore}<span className="text-sm font-normal text-slate-400">/100</span></p>
              <span className="text-[11px] text-amber-400 font-bold">High Diversity</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-xl hover:border-rose-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Priority
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Threat Alerts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-black text-white">{alerts.length || stats.activeAlerts}</p>
              <span className="text-[11px] text-rose-400 font-bold">Require Ranger Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sighting Timeline Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Apex Species Occurrence Trends
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Camera trap sightings & GPS collar frequency</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Updated Live
            </span>
          </div>
          <div className="h-[280px]">
            <Line data={trendData} options={chartOptionsDark} />
          </div>
        </div>

        {/* Taxonomic Breakdown Doughnut */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-400" />
                Taxonomic Diversity
              </h3>
              <span className="text-xs font-bold text-slate-400">Total: {stats.totalSpecies} Clades</span>
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <Doughnut data={speciesDistData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-center">
            <Link to="/species-catalog" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1">
              Explore Species Taxonomy Catalog &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Real-time Alerts Feed & Live Sensor Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              Conservation Intelligence & Threat Directives
            </h3>
            <Link to="/conservation" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
              Manage in Hub &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                      alert.severity === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    }`}></span>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{alert.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Threat: <span className="text-slate-300 font-medium">{alert.alert_type}</span> &bull; Sector: <span className="text-slate-300 font-medium">{alert.site_name || 'Nagarjuna Sagar Reserve'}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No active threats detected in this sector.
              </div>
            )}
          </div>
        </div>

        {/* Live Telemetry Node Status */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Wifi className="h-4 w-4 text-emerald-400" />
              Field Sensor Mesh Telemetry
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">NS Core Zone Cam 01</p>
                  <p className="text-[10px] text-slate-400">YOLOv8 Edge Camera Trap</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400">92% Battery</span>
                  <p className="text-[10px] text-emerald-300/70">Online &bull; 4G Mesh</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Acoustic Hydrophone B3</p>
                  <p className="text-[10px] text-slate-400">Audio Mating Call Monitor</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400">84% Battery</span>
                  <p className="text-[10px] text-emerald-300/70">Online &bull; LoRaWAN</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Ghats Ridge Drone Gate</p>
                  <p className="text-[10px] text-slate-400">Thermal Aerial Gateway</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400">68% Battery</span>
                  <p className="text-[10px] text-amber-300/70">Standby &bull; Solar</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link to="/monitoring-sites" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1">
              View All Monitoring Devices & Sites &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
