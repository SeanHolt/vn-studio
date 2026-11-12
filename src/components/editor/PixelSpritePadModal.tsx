'use client';

import React, { useState } from 'react';
import {
  GRID_SIZE,
  PIXEL_PALETTE,
  createEmptyGrid,
  floodFillGrid,
  renderPixelGridToPngFile,
} from '@/lib/vn-pixel-pad';
import { ProjectAsset } from '@/app/actions/asset-actions';
import {
  Paintbrush,
  Eraser,
  PaintBucket,
  RotateCcw,
  Save,
  X,
  Loader2,
} from 'lucide-react';

interface PixelSpritePadModalProps {
  projectId: string;
  onSavedAsset: (asset: ProjectAsset, url: string) => void;
  onClose: () => void;
}

export default function PixelSpritePadModal({
  projectId,
  onSavedAsset,
  onClose,
}: PixelSpritePadModalProps) {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [activeColor, setActiveColor] = useState('#3b82f6');
  const [tool, setTool] = useState<'PENCIL' | 'ERASER' | 'FILL'>('PENCIL');
  const [spriteName, setSpriteName] = useState('Custom Sprite');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyCellAction = (idx: number) => {
    if (tool === 'FILL') {
      setGrid((prev) => floodFillGrid(prev, idx, activeColor));
      return;
    }
    const nextColor = tool === 'ERASER' ? '' : activeColor;
    setGrid((prev) => {
      if (prev[idx] === nextColor) return prev;
      const copy = [...prev];
      copy[idx] = nextColor;
      return copy;
    });
  };

  const handleSaveToAssets = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const pngFile = await renderPixelGridToPngFile(grid, spriteName);
      if (!pngFile) {
        setErrorMsg('Could not render sprite image.');
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', pngFile);
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
        setErrorMsg(data.error || 'Failed to save sprite.');
        setIsSaving(false);
        return;
      }

      if (data.asset) {
        onSavedAsset(data.asset, data.url);
      }
      onClose();
    } catch {
      setErrorMsg('Network error saving pixel sprite.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      onMouseUp={() => setIsDrawing(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-indigo-500/40 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-indigo-400">
            <Paintbrush className="h-4 w-4" />
            <span className="text-sm">16×16 Pixel &amp; Doodle Sprite Pad</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Sprite name (e.g. Forest Slime)"
          value={spriteName}
          onChange={(e) => setSpriteName(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
        />

        {/* Tool Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTool('PENCIL')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                tool === 'PENCIL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Paintbrush className="h-3.5 w-3.5" /> Draw
            </button>
            <button
              type="button"
              onClick={() => setTool('FILL')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                tool === 'FILL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <PaintBucket className="h-3.5 w-3.5" /> Fill
            </button>
            <button
              type="button"
              onClick={() => setTool('ERASER')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                tool === 'ERASER'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eraser className="h-3.5 w-3.5" /> Erase
            </button>
          </div>

          <button
            type="button"
            onClick={() => setGrid(createEmptyGrid())}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:text-rose-300"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PIXEL_PALETTE.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => {
                setActiveColor(hex);
                if (tool === 'ERASER') setTool('PENCIL');
              }}
              style={{ backgroundColor: hex }}
              className={`h-6 w-6 rounded-md border transition ${
                activeColor === hex && tool !== 'ERASER'
                  ? 'scale-110 border-white ring-2 ring-indigo-400'
                  : 'border-slate-700'
              }`}
            />
          ))}
          <input
            type="color"
            value={activeColor}
            onChange={(e) => {
              setActiveColor(e.target.value);
              if (tool === 'ERASER') setTool('PENCIL');
            }}
            title="Custom Color"
            className="h-6 w-7 cursor-pointer rounded border border-slate-700 bg-slate-950"
          />
        </div>

        {/* 16x16 Drawing Canvas */}
        <div
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
          onMouseDown={() => setIsDrawing(true)}
          className="mx-auto grid aspect-square w-64 overflow-hidden rounded-lg border border-slate-700 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950"
        >
          {grid.map((cellColor, idx) => (
            <div
              key={idx}
              onMouseDown={() => applyCellAction(idx)}
              onMouseEnter={() => {
                if (isDrawing && tool !== 'FILL') applyCellAction(idx);
              }}
              style={{ backgroundColor: cellColor || 'transparent' }}
              className="border-[0.5px] border-slate-800/40"
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-center text-xs text-rose-400">{errorMsg}</p>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSaveToAssets()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving Sprite...' : 'Save to Project Assets & Use'}
        </button>
      </div>
    </div>
  );
}
