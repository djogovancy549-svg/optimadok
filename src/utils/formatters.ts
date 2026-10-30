/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcurementType, ReviewStatus, StageKey } from '../types/procurement';

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getProcurementTypeLabel(type: ProcurementType): { label: string; badgeClass: string; limitText: string } {
  switch (type) {
    case 'BARANG':
      return {
        label: 'Barang',
        badgeClass: 'text-stone-700 bg-stone-100 border-stone-200',
        limitText: 'Maks. Rp 200 Juta',
      };
    case 'KONSULTANSI':
      return {
        label: 'Jasa Konsultansi',
        badgeClass: 'text-[#701524] bg-rose-50 border-rose-200/80',
        limitText: 'Maks. Rp 100 Juta',
      };
    case 'KONSTRUKSI':
      return {
        label: 'Konstruksi',
        badgeClass: 'text-stone-800 bg-stone-100 border-stone-300',
        limitText: 'Maks. Rp 200 Juta',
      };
  }
}

export function getReviewStatusBadge(status: ReviewStatus): { label: string; textClass: string; bgClass: string; borderClass: string } {
  switch (status) {
    case 'DISETUJUI':
      return {
        label: 'Disetujui',
        textClass: 'text-emerald-800',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
      };
    case 'PERLU_PERBAIKAN':
      return {
        label: 'Perlu Revisi',
        textClass: 'text-[#701524]',
        bgClass: 'bg-rose-50',
        borderClass: 'border-rose-200',
      };
    case 'MENUNGGU_REVIEW':
      return {
        label: 'Menunggu Review',
        textClass: 'text-amber-800',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
      };
    case 'DRAFT':
      return {
        label: 'Draft',
        textClass: 'text-stone-600',
        bgClass: 'bg-stone-100',
        borderClass: 'border-stone-200',
      };
  }
}

export function getStageTitle(stageKey: StageKey): string {
  switch (stageKey) {
    case 'PERSIAPAN_PPK':
      return '1. Persiapan PPK';
    case 'PERMINTAAN_PENAWARAN':
      return '2. Penawaran Rekanan';
    case 'EVALUASI_PENAWARAN':
      return '3. Evaluasi Penawaran';
    case 'KLARIFIKASI_NEGOSIASI':
      return '4. Klarifikasi & Negosiasi';
    case 'PENETAPAN_BAHPL':
      return '5. Penetapan & BAHPL';
    case 'SPK_SELESAI':
      return '6. SPK & Selesai';
  }
}

/**
 * Converts Google Drive file view URLs or photo objects into direct browser-displayable image URLs
 */
export function getPhotoDisplayUrl(photoItem?: any): string {
  if (!photoItem) return 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';

  let rawUrl = '';
  let driveId = '';

  if (typeof photoItem === 'string') {
    rawUrl = photoItem;
  } else {
    driveId = photoItem.driveFileId || '';
    if (photoItem.thumbnailUrl) {
      rawUrl = photoItem.thumbnailUrl;
    } else if (photoItem.images && photoItem.images.length > 0) {
      for (const img of photoItem.images) {
        if (img && typeof img === 'string') {
          if (img.startsWith('data:') || img.startsWith('blob:')) return img;
          if (img.includes('drive.google.com') || img.includes('googleusercontent.com') || img.startsWith('http')) {
            rawUrl = img;
            break;
          }
        }
      }
    }
    if (!rawUrl) {
      rawUrl = photoItem.fileUrl || photoItem.url || '';
    }
  }

  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }

  // Extract Drive File ID from URL if driveId is not set
  if (!driveId && rawUrl) {
    const matchD = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const matchId = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      driveId = matchD[1];
    } else if (matchId && matchId[1]) {
      driveId = matchId[1];
    }
  }

  if (driveId) {
    // Return thumbnail URL which works reliably inside <img> tags for Google Drive images
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
  }

  if (rawUrl && rawUrl.startsWith('http')) {
    return rawUrl;
  }

  return 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80';
}
