/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProcurementPackage, DocumentItem } from '../types/procurement';
import {
  Printer,
  Edit3,
  Eye,
  Image as ImageIcon,
  Camera,
  LayoutGrid,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  FolderPlus,
  Tag,
  X,
  FileText
} from 'lucide-react';
import { getPhotoDisplayUrl, formatDate } from '../utils/formatters';

interface ActivitySession {
  id: string;
  name: string;
  date: string;
  notes?: string;
  selectedPhotoIds: string[];
}

interface ActivityDocumentationViewProps {
  procurementPackage: ProcurementPackage;
  documents: DocumentItem[];
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  onDocumentUploaded?: (newDoc: DocumentItem) => void;
}

const DEFAULT_PRESET_ACTIVITIES = [
  'Klarifikasi teknis dan Negosiasi',
  'Rapat Pre-Construction Meeting (PCM)',
  'Survei Lokasi & Peninjauan Lapangan',
  'Pemeriksaan & Serah Terima Pekerjaan (BAST)',
  'Opname Fisik & Pengukuran Progress Pekerjaan',
  'Rapat Koordinasi Lapangan'
];

export const ActivityDocumentationView: React.FC<ActivityDocumentationViewProps> = ({
  procurementPackage,
  documents,
  onShowToast,
  onDocumentUploaded,
}) => {
  const [viewMode, setViewMode] = useState<'SPLIT_VIEW' | 'FULL_PREVIEW'>('SPLIT_VIEW');
  
  // Storage key for activities of this package
  const storageKeyActivities = `sipelang_activities_${procurementPackage.id}`;
  const storageKeyTitles = `sipelang_photo_titles_${procurementPackage.id}`;

  // State for List of Activities ("Kegiatan")
  const [activities, setActivities] = useState<ActivitySession[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyActivities);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'act-1',
        name: 'Klarifikasi teknis dan Negosiasi',
        date: new Date().toISOString().slice(0, 10),
        notes: 'Kegiatan klarifikasi teknis dan negosiasi harga pengadaan langsung',
        selectedPhotoIds: [],
      },
    ];
  });

  const [activeActivityId, setActiveActivityId] = useState<string>(
    activities[0]?.id || 'act-1'
  );

  const activeActivity = activities.find((a) => a.id === activeActivityId) || activities[0];

  // Editable header fields for current activity
  const [kegiatanName, setKegiatanName] = useState(activeActivity ? activeActivity.name : 'Klarifikasi teknis dan Negosiasi');
  const [pekerjaan, setPekerjaan] = useState(procurementPackage.name);
  const [tanggal, setTanggal] = useState(activeActivity ? activeActivity.date : new Date().toISOString().slice(0, 10));

  // Modal to add new activity
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDate, setNewActivityDate] = useState(new Date().toISOString().slice(0, 10));

  // Photo Category Documents
  const [localPhotoDocs, setLocalPhotoDocs] = useState<DocumentItem[]>([]);
  
  useEffect(() => {
    const photoCategoryDocs = documents.filter(
      (d) =>
        d.packageId === procurementPackage.id &&
        (d.category === 'DOKUMENTASI_FOTO' ||
          d.fileType === 'jpg' ||
          d.fileType === 'png' ||
          (d.images && d.images.length > 0))
    );
    setLocalPhotoDocs(photoCategoryDocs);
  }, [documents, procurementPackage.id]);

  // Selected Photo IDs for active activity session
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  // State for custom photo titles (edit photo names)
  const [customPhotoTitles, setCustomPhotoTitles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKeyTitles);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Sync selected photo IDs when active activity changes
  useEffect(() => {
    if (activeActivity) {
      setKegiatanName(activeActivity.name);
      setTanggal(activeActivity.date);
      if (activeActivity.selectedPhotoIds && activeActivity.selectedPhotoIds.length > 0) {
        setSelectedPhotoIds(activeActivity.selectedPhotoIds);
      } else if (localPhotoDocs.length > 0) {
        // Default select up to 4 photos
        const defaultIds = localPhotoDocs.slice(0, 4).map((p) => p.id);
        setSelectedPhotoIds(defaultIds);
      }
    }
  }, [activeActivityId, localPhotoDocs.length]);

  // Save activities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyActivities, JSON.stringify(activities));
    } catch {
      // ignore
    }
  }, [activities]);

  // Save custom titles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyTitles, JSON.stringify(customPhotoTitles));
    } catch {
      // ignore
    }
  }, [customPhotoTitles]);

  const [customLogo] = useState<string | null>(() => localStorage.getItem('sipelang_official_logo'));

  // Toggle Photo Selection
  const togglePhotoSelection = (id: string) => {
    const nextIds = selectedPhotoIds.includes(id)
      ? selectedPhotoIds.filter((pid) => pid !== id)
      : [...selectedPhotoIds, id];

    setSelectedPhotoIds(nextIds);
    updateCurrentActivity({ selectedPhotoIds: nextIds });
  };

  // Helper to update active activity in state
  const updateCurrentActivity = (updates: Partial<ActivitySession>) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === activeActivityId ? { ...act, ...updates } : act))
    );
  };

  // Add new Activity session ("Tambah Kegiatan")
  const handleCreateNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    const newAct: ActivitySession = {
      id: `act-${Date.now()}`,
      name: newActivityTitle.trim(),
      date: newActivityDate,
      notes: '',
      selectedPhotoIds: localPhotoDocs.slice(0, 4).map((p) => p.id),
    };

    setActivities((prev) => [...prev, newAct]);
    setActiveActivityId(newAct.id);
    setKegiatanName(newAct.name);
    setTanggal(newAct.date);
    setSelectedPhotoIds(newAct.selectedPhotoIds);

    setIsAddActivityOpen(false);
    setNewActivityTitle('');
    if (onShowToast) onShowToast(`Kegiatan "${newAct.name}" berhasil ditambahkan!`, 'success');
  };

  // Delete an Activity session
  const handleDeleteActivity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activities.length <= 1) {
      if (onShowToast) onShowToast('Minimal harus ada 1 kegiatan dokumentasi!', 'error');
      return;
    }
    const filtered = activities.filter((a) => a.id !== id);
    setActivities(filtered);
    if (activeActivityId === id) {
      setActiveActivityId(filtered[0].id);
    }
    if (onShowToast) onShowToast('Kegiatan berhasil dihapus.', 'success');
  };

  // Edit custom title for a specific photo
  const handleUpdatePhotoTitle = (photoId: string, newTitle: string) => {
    setCustomPhotoTitles((prev) => ({
      ...prev,
      [photoId]: newTitle,
    }));
  };

  // Helper to get effective photo title
  const getDisplayTitle = (photo: DocumentItem): string => {
    if (customPhotoTitles[photo.id] !== undefined && customPhotoTitles[photo.id].trim() !== '') {
      return customPhotoTitles[photo.id];
    }
    return photo.title || photo.fileName || 'Foto Dokumentasi';
  };

  // Handle local photo upload directly
  const handleDirectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newDoc: DocumentItem = {
          id: `photo-direct-${Date.now()}-${idx}`,
          packageId: procurementPackage.id,
          title: `Foto: ${file.name.replace(/\.[^/.]+$/, '')}`,
          category: 'DOKUMENTASI_FOTO',
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          uploadDate: new Date().toISOString().slice(0, 10),
          uploadedBy: 'Pejabat Pengadaan',
          reviewStatus: 'DISETUJUI',
          fileType: (file.name.toLowerCase().endsWith('.png') ? 'png' : 'jpg') as 'jpg' | 'png',
          images: [dataUrl],
        };

        setLocalPhotoDocs((prev) => [newDoc, ...prev]);
        setSelectedPhotoIds((prev) => [...prev, newDoc.id]);
        if (onDocumentUploaded) {
          onDocumentUploaded(newDoc);
        }
      };
      reader.readAsDataURL(file);
    });

    if (onShowToast) onShowToast('Foto baru berhasil ditambahkan ke dokumentasi kegiatan!', 'success');
  };

  // Permanent photo deletion from uploaded list
  const handleDeletePermanentPhoto = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPhotoDocs((prev) => prev.filter((p) => p.id !== photoId));
    const nextSelected = selectedPhotoIds.filter((id) => id !== photoId);
    setSelectedPhotoIds(nextSelected);
    updateCurrentActivity({ selectedPhotoIds: nextSelected });
    if (onShowToast) onShowToast('Foto berhasil dihapus dari daftar unggahan.', 'success');
  };

  const selectedPhotos = localPhotoDocs.filter((p) => selectedPhotoIds.includes(p.id));

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Bar Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Dokumentasi Foto Kegiatan</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Pemkab Nagekeo
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Kelola daftar kegiatan, pilih foto, dan edit judul foto untuk laporan dokumentasi visual A4.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'SPLIT_VIEW' ? 'FULL_PREVIEW' : 'SPLIT_VIEW')}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-xl border border-stone-700 flex items-center gap-2 transition-all cursor-pointer text-stone-200"
          >
            {viewMode === 'SPLIT_VIEW' ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <Edit3 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{viewMode === 'SPLIT_VIEW' ? 'Format Penuh A4' : 'Mode Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className={`grid gap-6 ${viewMode === 'SPLIT_VIEW' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* LEFT CONTROL PANEL (When in SPLIT_VIEW) */}
        {viewMode === 'SPLIT_VIEW' && (
          <div className="lg:col-span-5 space-y-4 print:hidden no-print">
            
            {/* 1. SEKTOR PILIH & TAMBAH KEGIATAN */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                    Daftar Kegiatan ({activities.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(true)}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              {/* Activity Session Selector Pills */}
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {activities.map((act) => {
                  const isActive = act.id === activeActivityId;
                  return (
                    <div
                      key={act.id}
                      onClick={() => {
                        setActiveActivityId(act.id);
                        setKegiatanName(act.name);
                        setTanggal(act.date);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-2xs'
                          : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                          <span className={`text-xs font-bold line-clamp-1 ${isActive ? 'text-emerald-950' : 'text-stone-800'}`}>
                            {act.name}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">
                          Tanggal: {formatDate(act.date)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono">
                            Aktif
                          </span>
                        )}
                        {activities.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteActivity(act.id, e)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Hapus kegiatan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preset Buttons for Kegiatan */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Preset Nama Kegiatan Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_PRESET_ACTIVITIES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setKegiatanName(preset);
                        updateCurrentActivity({ name: preset });
                      }}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 rounded-lg transition-colors text-left cursor-pointer truncate max-w-full"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. EDIT INFORMASI FORMULIR DOKUMEN */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                Edit Detail Header Dokumen
              </h3>
              
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Nama Kegiatan (Kop Lembar)</label>
                  <input
                    type="text"
                    value={kegiatanName}
                    onChange={(e) => {
                      setKegiatanName(e.target.value);
                      updateCurrentActivity({ name: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Contoh: Klarifikasi teknis dan Negosiasi"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Pekerjaan Paket</label>
                  <textarea
                    rows={2}
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Tanggal Kegiatan</label>
                  <input
                    type="text"
                    value={tanggal}
                    onChange={(e) => {
                      setTanggal(e.target.value);
                      updateCurrentActivity({ date: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-xl font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Contoh: 08 Oktober 2026"
                  />
                </div>
              </div>
            </div>

            {/* 3. SEKTOR EDIT JUDUL FOTO & CAPTION */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                    Edit Judul & Caption Foto ({selectedPhotos.length} Dipilih)
                  </h3>
                </div>
                
                <label className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold rounded-lg border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Upload Foto Baru</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDirectPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedPhotos.length === 0 ? (
                <p className="text-xs text-stone-400 italic text-center py-4">
                  Belum ada foto yang dipilih. Centang foto pada grid di bawah untuk mengedit judulnya.
                </p>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectedPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-stone-300 bg-stone-200">
                        <img
                          src={getPhotoDisplayUrl(photo)}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (photo.driveFileId && !target.src.includes('lh3.googleusercontent')) {
                              target.src = `https://lh3.googleusercontent.com/d/${photo.driveFileId}`;
                            } else {
                              target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';
                            }
                          }}
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-800">
                            Foto #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePhotoSelection(photo.id)}
                            className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-rose-200"
                            title="Keluarkan foto ini dari lembar (matikan centang)"
                          >
                            <X className="w-3 h-3" />
                            <span>Matikan Centang</span>
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={getDisplayTitle(photo)}
                          onChange={(e) => handleUpdatePhotoTitle(photo.id, e.target.value)}
                          placeholder="Edit nama / judul foto yang cocok..."
                          className="w-full px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white font-semibold text-stone-900 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. SEKTOR GRID SELEKSI FOTO DARI UNGGAHAN */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                    Pilih Foto dari Unggahan ({localPhotoDocs.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold font-mono text-stone-500">
                  {selectedPhotoIds.length} Terpilih
                </span>
              </div>

              {localPhotoDocs.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-2">
                  <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-xs font-bold text-stone-700">Belum ada foto yang diunggah</p>
                  <p className="text-[11px] text-stone-400">
                    Klik tombol "Upload Foto Baru" di atas untuk menambahkan gambar kegiatan.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {localPhotoDocs.map((photo) => {
                    const isSelected = selectedPhotoIds.includes(photo.id);
                    const titleText = getDisplayTitle(photo);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => togglePhotoSelection(photo.id)}
                        className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer border-2 transition-all group ${
                          isSelected
                            ? 'border-emerald-600 shadow-md ring-2 ring-emerald-100'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={getPhotoDisplayUrl(photo)}
                          alt={titleText}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (photo.driveFileId && !target.src.includes('lh3.googleusercontent')) {
                              target.src = `https://lh3.googleusercontent.com/d/${photo.driveFileId}`;
                            } else {
                              target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';
                            }
                          }}
                        />

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-0.5 shadow-md z-10">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDeletePermanentPhoto(photo.id, e)}
                          className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md cursor-pointer"
                          title="Hapus foto ini secara permanen dari daftar unggahan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/75 text-[9px] text-white font-semibold truncate leading-tight">
                          {titleText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* RIGHT PREVIEW CANVAS: CETAK SURAT DOKUMENTASI RESMI UKURAN A4 */}
        <div className={`${viewMode === 'SPLIT_VIEW' ? 'lg:col-span-7' : 'max-w-4xl mx-auto w-full'} overflow-x-auto print:overflow-visible print:w-full print:max-w-none print:m-0 print:p-0`}>
          
          {/* Printable Document A4 Frame */}
          <div className="bg-white border border-stone-300 rounded-2xl shadow-xl p-8 md:p-10 font-sans text-stone-900 leading-normal min-w-[700px] print:shadow-none print:border-none print:p-0 print:m-0 print:w-full printable-document">
            
            {/* Kop Surat Resmi Pemkab Nagekeo */}
            <div className="relative pb-3 border-b-[3px] border-stone-900 flex items-center justify-center gap-4 avoid-break kop-surat-header">
              <div className={`w-16 h-20 shrink-0 flex items-center justify-center ${!customLogo ? 'print:hidden' : ''}`}>
                {customLogo ? (
                  <img src={customLogo} alt="Logo Pemkab Nagekeo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-stone-200 rounded-xl" />
                )}
              </div>
              <div className="text-center flex-1 pr-8">
                <h1 className="text-xs font-bold uppercase tracking-wider text-stone-950">PEMERINTAH KABUPATEN NAGEKEO</h1>
                <h2 className="text-sm md:text-base font-extrabold uppercase tracking-wide mt-0.5 text-stone-950">
                  {procurementPackage.skpdName}
                </h2>
                <p className="text-[10px] text-stone-600 font-medium tracking-tight italic">Kompleks Bendungan Sutami - Mbay</p>
                <p className="text-xs font-extrabold tracking-[0.25em] mt-1 text-stone-950">M B A Y</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="mt-6 text-center">
              <h3 className="text-sm font-black underline uppercase tracking-tight">
                DOKUMENTASI KEGIATAN PEJABAT PENGADAAN
              </h3>
            </div>

            {/* Document Attributes Table */}
            <div className="mt-5">
              <table className="w-full border-collapse border border-stone-900 text-[11px]">
                <tbody>
                  <tr>
                    <td className="border border-stone-900 p-2 font-bold w-[90px] bg-stone-50">Kegiatan</td>
                    <td className="border border-stone-900 p-2 font-semibold text-stone-900">{kegiatanName}</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-900 p-2 font-bold bg-stone-50">Pekerjaan</td>
                    <td className="border border-stone-900 p-2 font-semibold text-stone-900">{pekerjaan}</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-900 p-2 font-bold bg-stone-50">Tanggal</td>
                    <td className="border border-stone-900 p-2 font-semibold text-stone-900">{tanggal}</td>
                  </tr>
                </tbody>
              </table>

              {/* Photo Documentation Grid */}
              <div className="mt-6">
                <h4 className="text-center font-black uppercase text-xs mb-4 tracking-widest border-b border-stone-300 pb-1.5">
                  FOTO DOKUMENTASI VISUAL
                </h4>
                
                {selectedPhotos.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 italic text-[11px]">
                    (Belum ada foto yang dipilih untuk ditampilkan dalam lembar ini)
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPhotos.map((photo, idx) => {
                      const displayTitle = getDisplayTitle(photo);
                      return (
                        <div key={photo.id} className="border-[2.5px] border-stone-900 p-1.5 bg-white shadow-2xs relative group">
                          {/* Direct remove button overlay on A4 preview frame */}
                          <button
                            type="button"
                            onClick={() => togglePhotoSelection(photo.id)}
                            className="absolute top-2 right-2 bg-rose-700 hover:bg-rose-800 text-white px-2 py-1 rounded-lg shadow-md z-20 opacity-0 group-hover:opacity-100 transition-all print:hidden cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-rose-900"
                            title="Keluarkan / hapus foto ini dari lembar A4 (Matikan centang)"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Keluarkan dari Lembar</span>
                          </button>

                          <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 border border-stone-300">
                            <img
                              src={getPhotoDisplayUrl(photo)}
                              alt={displayTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (photo.driveFileId && !target.src.includes('lh3.googleusercontent')) {
                                  target.src = `https://lh3.googleusercontent.com/d/${photo.driveFileId}`;
                                } else {
                                  target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';
                                }
                              }}
                            />
                          </div>
                          
                          {/* Photo Title Caption */}
                          <div className="mt-1.5 text-center font-sans text-[10px] font-extrabold uppercase text-stone-900 border-t border-stone-200 pt-1 leading-snug px-1">
                            {displayTitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-16 text-[9px] text-stone-400 text-center font-mono uppercase tracking-widest border-t border-stone-200 pt-3">
              Lampiran Dokumentasi Visual - OPTIMA.DOK Record System Pemkab Nagekeo
            </div>
          </div>
        </div>

      </div>

      {/* MODAL TAMBAH KEGIATAN BARU */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-stone-900">Tambah Kegiatan Dokumentasi Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddActivityOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewActivity} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nama Kegiatan Dokumentasi <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  placeholder="Contoh: Peninjauan Lapangan Titik Nol / Opname Fisik"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tanggal Pelaksanaan
                </label>
                <input
                  type="text"
                  value={newActivityDate}
                  onChange={(e) => setNewActivityDate(e.target.value)}
                  placeholder="Contoh: 15 Oktober 2026"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
