import { Pencil, Trash2, Pill, Loader2 } from "lucide-react"
import type { Medication } from "../../../domain/models/Medication"
import { Button } from "../ui/Button"

export interface MedicationTableProps {
  medications: Medication[]
  onEdit: (medication: Medication) => void
  onDelete: (medication: Medication) => void
  loading: boolean
}

export function MedicationTable({
  medications,
  onEdit,
  onDelete,
  loading,
}: MedicationTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Cargando medicamentos...
        </span>
      </div>
    )
  }

  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Pill className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay medicamentos registrados
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Medicamento
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Paciente
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Dosis
            </th>
            <th className="text-left font-medium text-muted-foreground px-4 py-3">
              Frecuencia / Hora
            </th>
            <th className="text-right font-medium text-muted-foreground px-4 py-3">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {medications.map((medication) => (
            <tr
              key={medication.id}
              className="border-b border-border/50 hover:bg-accent/50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {medication.image_url ? (
                    <img
                      src={medication.image_url}
                      alt={medication.name}
                      className="h-9 w-9 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="font-medium">{medication.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {medication.users?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {medication.dosage || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {medication.frequency}
                {medication.time ? ` · ${medication.time}` : ""}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(medication)}
                    aria-label={`Editar ${medication.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(medication)}
                    aria-label={`Eliminar ${medication.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
