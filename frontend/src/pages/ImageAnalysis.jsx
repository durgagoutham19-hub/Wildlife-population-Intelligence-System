import React, { useState, useEffect, useRef } from 'react';
import { Upload, Eye, Cpu, Compass, Save, Sparkles, CheckCircle2, RefreshCw, AlertCircle, Camera, Check, Shield } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const imageRef = useRef(null);
  const canvasRef = useRef(null);

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
      setPreviewUrl(URL.createObjectURL(file));
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

    const res = await apiFetch('/api/v1/image-analysis/analyze', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      setErrorMsg(res.error || 'AI image analysis failed');
      setAnalyzing(false);
      return;
    }

    setAnalysisResult(res.data);
    setAnalyzing(false);
  };

  // Draw bounding boxes on canvas when image and result load
  useEffect(() => {
    if (analysisResult && imageRef.current && canvasRef.current) {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = img.clientWidth || 400;
      canvas.height = img.clientHeight || 300;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = img.naturalWidth ? (img.clientWidth / img.naturalWidth) : 1;
      const scaleY = img.naturalHeight ? (img.clientHeight / img.naturalHeight) : 1;

      if (Array.isArray(analysisResult.detections)) {
        analysisResult.detections.forEach((det) => {
          if (!det.box || det.box.length < 4) return;
          const [x1, y1, x2, y2] = det.box;
          const width = (x2 - x1) * scaleX;
          const height = (y2 - y1) * scaleY;
          const left = x1 * scaleX;
          const top = y1 * scaleY;

          // Glowing bounding box
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.strokeRect(left, top, width, height);

          // Reset shadow for label background
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
          const labelText = `${det.label} (${Math.round((det.confidence || 0.9) * 100)}%)`;
          ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillRect(left, Math.max(0, top - 24), textWidth + 14, 24);

          // Draw Label Text
          ctx.fillStyle = '#022c22';
          ctx.fillText(labelText, left + 7, Math.max(16, top - 8));
        });
      }
    }
  }, [analysisResult, previewUrl]);

  const saveObservation = async () => {
    if (!analysisResult) return;
    setSaving(true);
    setErrorMsg('');

    const targetSurveyId = selectedSurvey || (surveys[0] ? surveys[0].id : 1);

    const payload = {
      survey_id: parseInt(targetSurveyId),
      species_name: analysisResult.detected_species || 'Wild Animal',
      count: analysisResult.animal_count || 1,
      confidence_score: analysisResult.confidence || 0.9,
      observation_type: 'image',
      file_path: analysisResult.file_path,
      behavior_observed: analysisResult.behavior_detected || 'Alert',
      analysis_data: analysisResult,
      notes: `AI classification: ${analysisResult.detected_species}. Latency: ${analysisResult.processing_time_ms} ms.`
    };

    const res = await apiFetch('/api/v1/image-analysis/save-observation', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setSavedSuccess(true);
    } else {
      setErrorMsg(res.error || 'Failed to save observation');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <Camera className="h-6 w-6 text-emerald-400" />
            Wildlife Computer Vision Sighting Lab
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            YOLOv8 deep learning animal detection, bounding box spatial segmentation & count estimation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            YOLOv8x-Wildlife Active
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
              1. Field Telemetry & Photo Input
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Survey Project
              </label>
              <select
                value={selectedSurvey}
                onChange={(e) => setSelectedSurvey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {surveys.length === 0 && <option value="1">Default Census Survey (Reserve Grid A)</option>}
                {surveys.map((s) => (
                  <option key={s.id} value={s.id}>{s.survey_name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition-all bg-slate-950/40 group">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  Upload Camera Trap Photo
                </span>
                <span className="text-[11px] text-slate-500 mt-1">Supports JPEG, PNG, RAW, WEBP from camera traps</span>
              </label>
            </div>

            {selectedFile && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
                <span className="truncate max-w-[180px] font-medium">{selectedFile.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{Math.round(selectedFile.size / 1024)} KB</span>
              </div>
            )}
          </div>

          <button
            onClick={runAnalysis}
            disabled={!selectedFile || analyzing}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {analyzing ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Running YOLOv8 Neural Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Execute Vision Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Detection Preview */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between space-y-4 min-h-[420px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                2. Neural Vision Segmentation & Detections
              </h3>
              {analysisResult && (
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {analysisResult.animal_count || 1} Animal(s) Detected
                </span>
              )}
            </div>
            
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[290px]">
              {previewUrl ? (
                <div className="relative max-w-full">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Upload Preview"
                    className="max-h-[360px] w-auto object-contain block mx-auto rounded-lg"
                    onLoad={() => {
                      if (analysisResult && canvasRef.current && imageRef.current) {
                        const img = imageRef.current;
                        const canvas = canvasRef.current;
                        canvas.width = img.clientWidth;
                        canvas.height = img.clientHeight;
                      }
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 space-y-2">
                  <Eye className="h-12 w-12 mx-auto text-slate-700 animate-pulse" />
                  <p className="text-xs text-slate-400">No camera trap image loaded. Upload a wildlife photo to begin.</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Bar */}
          {analysisResult && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Identified Species</p>
                  <p className="text-sm font-black text-white mt-0.5">{analysisResult.detected_species || 'Wildlife'}</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Confidence</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">{Math.round((analysisResult.confidence || 0.94) * 100)}%</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Count Detected</p>
                  <p className="text-sm font-black text-cyan-400 mt-0.5">{analysisResult.animal_count || 1} individual(s)</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Inference Latency</p>
                  <p className="text-sm font-black text-amber-400 mt-0.5">{analysisResult.processing_time_ms || 38} ms</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Model: <span className="text-slate-300 font-mono">{analysisResult.model_version || 'YOLOv8x-Wildlife'}</span>
                </span>
                
                {savedSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Observation Persisted to Database</span>
                  </div>
                ) : (
                  <button
                    onClick={saveObservation}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? 'Saving...' : 'Save as Verified Observation'}</span>
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
