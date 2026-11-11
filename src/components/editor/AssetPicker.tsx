'use client';

import React, { useRef, useState } from 'react';
import { STARTER_ASSETS } from '@/lib/starter-assets';
import { Upload, Check, Loader2 } from 'lucide-react';
import StageArtwork from '../shared/StageArtwork';
import { useEditorStore } from '@/store/useEditorStore';
import { ProjectAsset } from '@/app/actions/asset-actions';

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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const { projectId, assets, addAsset } = useEditorStore();
    const customImages = assets.filter((a) => a.category === 'IMAGE');

    const presets = STARTER_ASSETS.filter((item) => item.category === category);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok || !data.url) {
                setUploadError(data.error || 'Upload failed');
            } else {
                onSelectUrl(data.url);
            }
        } catch {
            setUploadError('Network error while uploading image.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {category === 'BACKGROUND' ? 'Choose Background' : 'Choose Sprite'}
                </span>
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    {isUploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Upload className="h-3 w-3" />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload Art'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {uploadError && (
                <p className="rounded bg-red-950/60 px-2 py-1 text-[11px] text-red-300">
                    {uploadError}
                </p>
            )}

            {/* Built-in Starter Thumbnails */}
            <div className="grid grid-cols-3 gap-2">
                {presets.map((asset) => {
                    const isSelected = currentUrl === asset.url;
                    return (
                        <button
                            key={asset.id}
                            type="button"
                            onClick={() => onSelectUrl(asset.url)}
                            className={`group relative overflow-hidden rounded-lg border text-left transition ${isSelected
                                    ? 'border-indigo-400 ring-2 ring-indigo-500/40'
                                    : 'border-slate-800 hover:border-slate-600'
                                }`}
                        >
                            <div className="aspect-video w-full bg-slate-950">
                                <StageArtwork
                                    assetUrl={asset.url}
                                    alt={asset.label}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="truncate bg-slate-950/90 px-1.5 py-1 text-[10px] text-slate-300">
                                {asset.label}
                            </div>
                            {isSelected && (
                                <div className="absolute top-1 right-1 rounded-full bg-indigo-600 p-0.5 text-white">
                                    <Check className="h-2.5 w-2.5" />
                                </div>
                            )}
                        </button>
                    );
                })}
                {customImages.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                        <span className="text-[11px] font-medium text-sky-400">
                            Your Uploaded Images
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {customImages.map((asset) => {
                                const isSelected = currentUrl === asset.url;
                                return (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => onSelectUrl(asset.url)}
                                        className={`relative overflow-hidden rounded-lg border text-left transition ${isSelected
                                                ? 'border-sky-400 ring-2 ring-sky-500/40'
                                                : 'border-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="aspect-video w-full bg-slate-950">
                                            <img
                                                src={asset.url}
                                                alt={asset.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="truncate bg-slate-950/90 px-1.5 py-1 text-[10px] text-slate-300">
                                            {asset.name}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Direct URL Fallback Input */}
            <input
                type="text"
                placeholder="Or paste custom /uploads/... URL"
                value={currentUrl}
                onChange={(e) => onSelectUrl(e.target.value)}
                className="rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300"
            />
        </div>
    );
}
