'use client';

import React, { useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
  ProjectAsset,
  renameProjectAsset,
  deleteProjectAsset,
} from '@/app/actions/asset-actions';
import { FolderOpen, Upload, Trash2, Volume2, Loader2 } from 'lucide-react';

export default function AssetLibraryPanel() {
  const {
    projectId,
    assets,
    addAsset,
    renameAssetLocal,
    removeAssetLocal,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file || !projectId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as { asset?: ProjectAsset };
      if (res.ok && data.asset) {
        addAsset(data.asset);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRename = async (assetId: string, nextName: string) => {
    renameAssetLocal(assetId, nextName);
    await renameProjectAsset(assetId, nextName, projectId);
  };

  const handleDelete = async (assetId: string) => {
    removeAssetLocal(assetId);
    await deleteProjectAsset(assetId, projectId);
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-sky-400 uppercase">
          <FolderOpen className="h-3.5 w-3.5" /> Project Assets ({assets.length})
        </span>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 rounded bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {assets.length === 0 ? (
        <p className="text-xs text-slate-500">
          No custom files uploaded yet. Upload images or audio to reuse across scenes.
        </p>
      ) : (
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950 p-2"
            >
              {asset.category === 'IMAGE' ? (
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-9 w-12 shrink-0 rounded object-cover bg-slate-900"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const audio = new Audio(asset.url);
                    audio.volume = 0.5;
                    void audio.play();
                  }}
                  className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-slate-900 text-pink-400 hover:bg-slate-800"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}

              <input
                type="text"
                value={asset.name}
                onChange={(e) => void handleRename(asset.id, e.target.value)}
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-slate-200 focus:border-slate-700 focus:bg-slate-900 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => void handleDelete(asset.id)}
                title="Delete Asset"
                className="text-slate-500 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
