import { useState, useEffect, useRef } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import type {
  Medication,
  CreateMedicationDTO,
  UpdateMedicationDTO,
} from "../../../domain/models/Medication"

export interface PatientOption {
  id: string
  name: string
}

export interface MedicationFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (
    data: CreateMedicationDTO | UpdateMedicationDTO,
    imageFile?: File
  ) => Promise<void>
  medication?: Medication
  patients: PatientOption[]
}

interface FormErrors {
  name?: string
  frequency?: string
  patient_id?: string
}

export function MedicationFormModal({
  open,
  onClose,
  onSubmit,
  medication,
  patients,
}: MedicationFormModalProps) {
  const isEditMode = !!medication

  const [patientId, setPatientId] = useState("")
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens or medication changes
  useEffect(() => {
    if (open) {
      if (medication) {
        setPatientId(String(medication.patient_id))
        setName(medication.name)
        setDosage(medication.dosage || "")
        setFrequency(medication.frequency || "")
        setTime(medication.time || "")
        setNotes(medication.notes || "")
        setImagePreview(medication.image_url || null)
      } else {
        setPatientId("")
        setName("")
        setDosage("")
        setFrequency("")
        setTime("")
        setNotes("")
        setImagePreview(null)
      }
      setImageFile(null)
      setErrors({})
      setServerError(null)
      setSubmitting(false)
    }
  }, [open, medication])

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name = "El nombre es obligatorio"
    if (!frequency.trim()) errs.frequency = "La frecuencia es obligatoria"
    if (!isEditMode && !patientId) errs.patient_id = "Debe seleccionar un paciente"
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setServerError(null)
    setSubmitting(true)

    try {
      if (isEditMode) {
        const data: UpdateMedicationDTO = {
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          time: time.trim(),
          notes: notes.trim() || undefined,
          image_url: undefined,
        }
        await onSubmit(data, imageFile || undefined)
      } else {
        const data: CreateMedicationDTO = {
          patient_id: Number(patientId),
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          time: time.trim(),
          notes: notes.trim() || undefined,
          image_url: undefined,
        }
        await onSubmit(data, imageFile || undefined)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Editar medicamento" : "Nuevo medicamento"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient select */}
          <div>
            <label
              htmlFor="patient_id"
              className="block text-sm font-medium mb-1"
            >
              Paciente {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <select
              id="patient_id"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={isEditMode}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none"
            >
              <option value="">Seleccionar paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-500">{errors.patient_id}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del medicamento"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label htmlFor="dosage" className="block text-sm font-medium mb-1">
              Dosis
            </label>
            <input
              id="dosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ej: 500mg"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Frequency */}
          <div>
            <label
              htmlFor="frequency"
              className="block text-sm font-medium mb-1"
            >
              Frecuencia <span className="text-red-500">*</span>
            </label>
            <input
              id="frequency"
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="Ej: Cada 8 horas"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-500">{errors.frequency}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              Horario
            </label>
            <input
              id="time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ej: 08:00, 16:00, 00:00"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Imagen</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Upload className="h-4 w-4" />
                Subir imagen
              </button>
              {imageFile && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {imageFile.name}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="h-24 w-24 rounded-md object-cover border border-border"
                />
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 transition-all"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? "Guardar cambios" : "Crear medicamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
