import React, { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, Eye, EyeOff, Trash2, X, AlertTriangle } from 'lucide-react';
import { validateDailyPin } from '../utils/securityPin';

export interface SecurityPinModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemTypeLabel?: string;
  warningNote?: string;
  isProcessing?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  title = 'Konfirmasi Penghapusan dengan PIN',
  itemName,
  itemTypeLabel = 'Item / Berkas',
  warningNote,
  isProcessing = false,
  onConfirm,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pinInput.trim()) {
      setErrorMessage('Silakan masukkan PIN keamanan terlebih dahulu.');
      return;
    }

    const isValid = validateDailyPin(pinInput);
    if (!isValid) {
      setErrorMessage('PIN keamanan salah! Akses ditolak.');
      return;
    }

    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-800 to-[#701524] text-white p-4.5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-rose-100 shadow-inner shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wide">{title}</h3>
              <p className="text-[11px] text-rose-200/90 font-medium">
                Dilindungi Verifikasi PIN Dinamis Harian Dokumen.KU PBJ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Item Details */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/90 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
              {itemTypeLabel} yang akan dihapus:
            </span>
            <p className="text-xs font-bold text-stone-900 break-words leading-snug">
              {itemName || 'Berkas/Data terpilih'}
            </p>
          </div>

          {/* Warning / Drive Notice */}
          {warningNote && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Peringatan Penghapusan</span>
              </div>
              <p className="leading-relaxed">{warningNote}</p>
            </div>
          )}



          {/* PIN Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-stone-800">
              Masukkan PIN Hari Ini:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Masukkan PIN keamanan..."
                className={`w-full pl-9 pr-10 py-2.5 text-xs font-mono border rounded-xl focus:outline-none focus:ring-2 bg-white text-stone-900 transition-all ${
                  errorMessage
                    ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-stone-300 focus:ring-[#701524]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
              <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1 animate-fade-in">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Verifikasi & Hapus</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
