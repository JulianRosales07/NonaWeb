import { AlertTriangle, Loader2 } from "lucide-react"

export interface DeleteConfirmDialogProps {
  open: boolean
  medicationName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

export function DeleteConfirmDialog({
  open,
  medicationName,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmDialogProps) {
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !loading) {
      onCancel()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 rounded-lg border border-border bg-background p-6 shadow-xl">
        {/* Warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold">Eliminar medicamento</h2>
        </div>

        {/* Confirmation message */}
        <p className="text-sm text-muted-foreground mb-2">
          ¿Estás seguro de que deseas eliminar el medicamento{" "}
          <span className="font-medium text-foreground">'{medicationName}'</span>?
        </p>

        {/* Warning text */}
        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
          Esta acción no se puede deshacer.
        </p>

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50 transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
