'use client';

import React, { useRef, useState } from 'react';
import { STARTER_ASSETS } from '@/lib/starter-assets';
import { useEditorStore } from '@/store/useEditorStore';
import { ProjectAsset } from '@/app/actions/asset-actions';
import StageArtwork from '@/components/shared/StageArtwork';
import PixelSpritePadModal from './PixelSpritePadModal';
import { Upload, CheckCircle2, Loader2, Paintbrush } from 'lucide-react';

interface AssetPickerProps {
  category: 'BACKGROUND' | 'CHARACTER';
  currentUrl: string;
  onSelectUrl: (url: string) => void;
}

export default function AssetPicker({
  category,
  currentUrl,
  onSelectUrl,
}: AssetPickerProps) {
  const { projectId, assets, addAsset } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPixelPad, setShowPixelPad] = useState(false);

  const presets = STARTER_ASSETS.filter((a) => a.category === category);
  const customImages = assets.filter((a) => a.category === 'IMAGE');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) {
        formData.append('projectId', projectId);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json()) as {
        url?: string;
        asset?: ProjectAsset;
        error?: string;
      };

      if (!res.ok || !data.url) {
        setUploadError(data.error || 'Upload failed.');
        return;
      }

      if (data.asset) {
        addAsset(data.asset);
      }
      onSelectUrl(data.url);
    } catch {
      setUploadError('Network error during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <span className="text-xs font-medium text-slate-400">
          {category === 'BACKGROUND' ? 'Select Backdrop' : 'Select Sprite'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPixelPad(true)}
            className="flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500"
          >
            <Paintbrush className="h-3 w-3" /> Draw Sprite
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-xs text-rose-400">{uploadError}</p>
      )}

      {/* Built-in Starter Presets */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map((asset) => {
          const isSelected = currentUrl === asset.url;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelectUrl(asset.url)}
              className={`group relative flex flex-col items-center overflow-hidden rounded-lg border p-1.5 text-center transition ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-950/50 ring-1 ring-indigo-400'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <StageArtwork
                assetUrl={asset.url}
                alt={asset.label}
                className="h-12 w-full rounded object-cover"
              />
              <span className="mt-1 line-clamp-1 text-[10px] text-slate-300">
                {asset.label}
              </span>
              {isSelected && (
                <CheckCircle2 className="absolute top-1 right-1 h-3.5 w-3.5 text-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Previously Uploaded / Drawn Project Images */}
      {customImages.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-emerald-400">
            Your Project Images
          </span>
          <div className="grid grid-cols-3 gap-2">
            {customImages.map((asset) => {
              const isSelected = currentUrl === asset.url;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelectUrl(asset.url)}
                  className={`relative flex flex-col items-center overflow-hidden rounded-lg border p-1.5 text-center transition ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/40 ring-1 ring-emerald-400'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <StageArtwork
                    assetUrl={asset.url}
                    alt={asset.name}
                    className="h-12 w-full rounded object-cover"
                  />
                  <span className="mt-1 line-clamp-1 text-[10px] text-slate-300">
                    {asset.name}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="absolute top-1 right-1 h-3.5 w-3.5 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom URL Fallback */}
      <input
        type="text"
        placeholder="Or paste custom image URL..."
        value={currentUrl}
        onChange={(e) => onSelectUrl(e.target.value)}
        className="mt-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300"
      />

      {showPixelPad && (
        <PixelSpritePadModal
          projectId={projectId}
          onSavedAsset={(newAsset, url) => {
            addAsset(newAsset);
            onSelectUrl(url);
          }}
          onClose={() => setShowPixelPad(false)}
        />
      )}
    </div>
  );
}
