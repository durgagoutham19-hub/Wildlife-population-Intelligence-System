import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, BookOpen, Compass, Search, PawPrint, Tag } from 'lucide-react';
import { apiFetch } from '../utils/api';

const STATUS_COLORS = {
  Endangered: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'Critically Endangered': 'bg-red-500/20 text-red-300 border-red-500/30',
  Vulnerable: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Near Threatened': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Least Concern': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

export default function SpeciesCatalog() {
  const [speciesList, setSpeciesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpecies() {
      setLoading(true);
      const res = await apiFetch('/api/v1/species');
      if (res.ok && Array.isArray(res.data)) {
        setSpeciesList(res.data);
      }
      setLoading(false);
    }
    loadSpecies();
  }, []);

  const filteredSpecies = speciesList.filter(s => {
    const matchesSearch = s.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.scientific_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup ? s.species_group?.toLowerCase() === selectedGroup.toLowerCase() : true;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            Taxonomic Species Catalog
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            IUCN conservation listings, ecological trophic roles & sighting registry.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search species..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Clades</option>
            <option value="mammal">Mammals</option>
            <option value="bird">Birds</option>
            <option value="reptile">Reptiles</option>
            <option value="amphibian">Amphibians</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading taxonomic database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecies.map((sp) => {
            const statusClass = STATUS_COLORS[sp.conservation_status] || 'bg-slate-800 text-slate-300 border-slate-700';
            return (
              <div
                key={sp.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {sp.common_name}
                      </h3>
                      <p className="text-xs text-slate-400 italic mt-0.5">{sp.scientific_name}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border shrink-0 ${statusClass}`}>
                      {sp.conservation_status || 'Observed'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {sp.description || "Active apex species tracked in regional conservation zones."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Taxon Group</span>
                      <span className="font-semibold text-slate-200 capitalize">{sp.species_group}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Diet Niche</span>
                      <span className="font-semibold text-slate-200 capitalize">{sp.diet_type}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Primary Habitat</span>
                      <span className="font-semibold text-slate-200 truncate block">{sp.habitat_type}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">IUCN Red List</span>
                      <span className="font-semibold text-emerald-400">{sp.iucn_status || "LC"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <PawPrint className="h-3.5 w-3.5 text-emerald-400" />
                    Recorded Sightings: {sp.total_observations || 0}
                  </span>
                  <span className="text-[11px] text-slate-500">ID: #{sp.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
