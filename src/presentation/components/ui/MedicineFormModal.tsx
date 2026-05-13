import { useState, useRef, useEffect } from 'react';

import { X, Save, RefreshCw, Image as ImageIcon, Upload } from 'lucide-react';
import { UploadService } from '../../../application/services/UploadService.ts';


interface Props {
  open: boolean;
  saving: boolean;
  isReadOnly?: boolean;
  initialData?: { id?: number; name: string; imageUrl: string };
  onSave: (data: { name: string; imageUrl: string }) => void;
  onClose: () => void;
}

export function MedicineFormModal({ open, saving, isReadOnly, initialData, onSave, onClose }: Props) {

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with initialData when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setImageUrl(initialData?.imageUrl || '');
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ name, imageUrl });
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await UploadService.uploadMedicineImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 relative z-10 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg bg-blue-600 shadow-blue-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isReadOnly ? 'Detalles del Medicamento' : initialData?.id ? 'Editar Medicamento' : 'Crear Medicamento'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isReadOnly ? 'Información completa del registro' : initialData?.id ? 'Modifica los datos del medicamento' : 'Sube un nuevo medicamento al catálogo global'}
              </p>
            </div>


          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Medicamento *</label>
            <input 
              type="text" 
              required 
              readOnly={isReadOnly}
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Acetaminofén 500mg"
              className={`w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${isReadOnly ? 'bg-slate-50 text-slate-500' : ''}`} 
            />

          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Imagen del Medicamento</label>
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              {imageUrl ? (
                <div className="relative group w-32 h-32">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                  <button 
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  {uploading ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <ImageIcon className="w-8 h-8" />
                  )}
                  <span className="text-xs font-medium">{uploading ? 'Subiendo...' : 'Sin imagen seleccionada'}</span>
                </div>
              )}
              
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  {imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}
                </button>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button type="submit" disabled={saving || uploading || !name}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : initialData?.id ? 'Guardar Cambios' : 'Crear Medicamento'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
