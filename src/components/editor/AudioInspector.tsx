'use client';

import React, { useRef, useState } from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { AUDIO_PRESETS, playSynthSound } from '@/lib/vn-audio';
import { useEditorStore } from '@/store/useEditorStore';
import { ProjectAsset } from '@/app/actions/asset-actions';
import { Volume2, Upload, Loader2 } from 'lucide-react';

interface AudioInspectorProps {
  block: Extract<SceneBlock, { type: 'PLAY_AUDIO' }>;
  onChange: (updated: SceneBlock) => void;
}

export default function AudioInspector({ block, onChange }: AudioInspectorProps) {
  const { projectId, assets, addAsset } = useEditorStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const presets = AUDIO_PRESETS.filter((p) => p.category === block.audioType);
  const customAudioAssets = assets.filter((a) => a.category === 'AUDIO');

  const handlePreview = (url: string) => {
    if (url.startsWith('synth:')) {
      const stop = playSynthSound(url);
      if (url.startsWith('synth:ambient') && stop) {
        window.setTimeout(stop, 1500);
      }
    } else if (url) {
      const audio = new Audio(url);
      audio.volume = 0.5;
      void audio.play();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) {
        formData.append('projectId', projectId);
      }
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as { url?: string; asset?: ProjectAsset };
      if (res.ok && data.url) {
        if (data.asset) {
          addAsset(data.asset);
        }
        onChange({ ...block, soundUrl: data.url });
      }
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Channel</span>
          <select
            value={block.audioType}
            onChange={(e) => {
              const nextType = e.target.value as 'SFX' | 'BGM';
              const firstPreset = AUDIO_PRESETS.find((p) => p.category === nextType);
              onChange({
                ...block,
                audioType: nextType,
                loop: nextType === 'BGM',
                soundUrl: firstPreset?.url ?? '',
              });
            }}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="SFX">Sound Effect (SFX)</option>
            <option value="BGM">Background Music</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Action</span>
          <select
            value={block.action}
            onChange={(e) =>
              onChange({ ...block, action: e.target.value as 'play' | 'stop' })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="play">Play Audio</option>
            <option value="stop">Stop Audio</option>
          </select>
        </label>
      </div>

      {block.action === 'play' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Built-In Presets</span>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-500"
            >
              {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Upload MP3/WAV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/ogg"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-xs ${
                  block.soundUrl === preset.url
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onChange({ ...block, soundUrl: preset.url })}
                  className="flex-1 text-left"
                >
                  {preset.label}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreview(preset.url)}
                  title="Preview Sound"
                  className="rounded p-1 text-indigo-400 hover:bg-slate-800"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {customAudioAssets.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-sky-400">
                Your Uploaded Audio
              </span>
              {customAudioAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-xs ${
                    block.soundUrl === asset.url
                      ? 'border-sky-500 bg-sky-950/40 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...block, soundUrl: asset.url })}
                    className="flex-1 truncate text-left"
                  >
                    {asset.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreview(asset.url)}
                    title="Preview Sound"
                    className="rounded p-1 text-sky-400 hover:bg-slate-800"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
