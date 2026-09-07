import React, { useState, useEffect } from 'react';
import { Upload, Music, Play, BarChart2, Save, Sparkles, CheckCircle2, RefreshCw, AlertCircle, Volume2, Radio } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function AudioAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadSurveys() {
      const res = await apiFetch('/api/v1/surveys');
      if (res.ok && Array.isArray(res.data)) {
        setSurveys(res.data);
        if (res.data.length > 0) setSelectedSurvey(res.data[0].id);
      }
    }
    loadSurveys();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setSavedSuccess(false);
      setErrorMsg('');
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setSavedSuccess(false);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await apiFetch('/api/v1/audio-analysis/analyze', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      setErrorMsg(res.error || 'Bioacoustic analysis failed');
      setAnalyzing(false);
      return;
    }

    setAnalysisResult(res.data);
    setAnalyzing(false);
  };

  const saveObservation = async () => {
    if (!analysisResult) return;
    setSaving(true);
    setErrorMsg('');

    const targetSurveyId = selectedSurvey || (surveys[0] ? surveys[0].id : 1);

    const payload = {
      survey_id: parseInt(targetSurveyId),
      species_name: analysisResult.detected_species || 'Vocalizing Animal',
      count: 1,
      confidence_score: analysisResult.confidence || 0.88,
      observation_type: 'audio',
      file_path: analysisResult.file_path,
      behavior_observed: analysisResult.call_type || 'Territorial Call',
      analysis_data: analysisResult,
      notes: `Bioacoustic signature: ${analysisResult.detected_species} (${analysisResult.call_type}). Latency: ${analysisResult.processing_time_ms} ms.`
    };

    const res = await apiFetch('/api/v1/audio-analysis/save-observation', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setSavedSuccess(true);
    } else {
      setErrorMsg(res.error || 'Failed to save bioacoustic record');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <Volume2 className="h-6 w-6 text-cyan-400" />
            Bioacoustic Audio Intelligence Engine
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Mel-spectrogram Fast Fourier Transform (FFT), harmonic resonance analysis & vocalization classification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Bioacoustic-v2.1 Active
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              1. Audio Recording Selection
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Survey Project
              </label>
              <select
                value={selectedSurvey}
                onChange={(e) => setSelectedSurvey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {surveys.length === 0 && <option value="1">Default Census Survey</option>}
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>{s.survey_name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition-all bg-slate-950/40 group">
              <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
                <div className="h-14 w-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Music className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  Choose Acoustic Clip
                </span>
                <span className="text-[11px] text-slate-500 mt-1">WAV, MP3, FLAC, M4A from field hydrophones & microphones</span>
              </label>
            </div>

            {selectedFile && (
              <div className="space-y-2">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
                  <span className="truncate max-w-[180px] font-medium">{selectedFile.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{Math.round(selectedFile.size / 1024)} KB</span>
                </div>
                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full h-9 rounded-lg bg-slate-950" />
                )}
              </div>
            )}
          </div>

          <button
            onClick={runAnalysis}
            disabled={!selectedFile || analyzing}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {analyzing ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing Mel-Spectrogram FFT...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run Acoustic Classifier</span>
              </>
            )}
          </button>
        </div>

        {/* Spectrogram & Vocalization Insights */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between space-y-4 min-h-[420px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                2. Mel-Spectrogram & Harmonic Signature
              </h3>
              {analysisResult && (
                <span className="text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Call Type: {analysisResult.call_type || 'Alarm Call'}
                </span>
              )}
            </div>
            
            <div className="rounded-2xl bg-slate-950 border border-slate-800/80 p-5 min-h-[220px] flex items-center justify-center">
              {analysisResult?.spectrogram_url ? (
                <div className="space-y-2 w-full text-center">
                  <img
                    src={analysisResult.spectrogram_url}
                    alt="Mel Spectrogram"
                    className="w-full max-h-[230px] object-contain rounded-xl mx-auto border border-slate-800"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">Time (s) vs Frequency (Hz) Harmonic Energy Distribution</p>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 space-y-2">
                  <BarChart2 className="h-12 w-12 mx-auto text-slate-700 animate-pulse" />
                  <p className="text-xs text-slate-400">No bioacoustic data analyzed yet. Upload an audio recording on the left.</p>
                </div>
              )}
            </div>
          </div>

          {/* Identification Cards */}
          {analysisResult && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Classified Species</p>
                  <p className="text-sm font-black text-white mt-0.5">{analysisResult.detected_species || 'Vocalizing Taxa'}</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Confidence</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">{Math.round((analysisResult.confidence || 0.88) * 100)}%</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Call Type</p>
                  <p className="text-sm font-black text-cyan-400 mt-0.5">{analysisResult.call_type || 'Territorial Call'}</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Frequency Band</p>
                  <p className="text-sm font-black text-amber-400 mt-0.5">{analysisResult.frequency_range || '1.5 - 8 kHz'}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Model: <span className="text-slate-300 font-mono">{analysisResult.model_version || 'Bioacoustic-Classifier-v2.1'}</span>
                </span>
                
                {savedSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Bioacoustic Observation Logged to Database</span>
                  </div>
                ) : (
                  <button
                    onClick={saveObservation}
                    disabled={saving}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? 'Saving...' : 'Save as Verified Acoustic Record'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
