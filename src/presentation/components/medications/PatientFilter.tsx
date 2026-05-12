import { Users } from "lucide-react"
import { cn } from "../../lib/utils"

export interface PatientOption {
  id: string
  name: string
}

export interface PatientFilterProps {
  patients: PatientOption[]
  selectedPatientId: string | null
  onChange: (patientId: string | null) => void
  className?: string
}

export function PatientFilter({
  patients,
  selectedPatientId,
  onChange,
  className,
}: PatientFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onChange(value === "" ? null : value)
  }

  return (
    <div className={cn("relative", className)}>
      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <select
        value={selectedPatientId ?? ""}
        onChange={handleChange}
        className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none cursor-pointer"
      >
        <option value="">Todos los pacientes</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
    </div>
  )
}
