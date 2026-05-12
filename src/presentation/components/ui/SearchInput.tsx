import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  debounceMs?: number
  className?: string
}

export function SearchInput({
  placeholder = "Buscar...",
  value = "",
  onChange,
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isControlled = value !== undefined

  // Sync internal value when controlled value changes externally
  useEffect(() => {
    if (isControlled) {
      setInternalValue(value)
    }
  }, [value, isControlled])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)

    // Clear any pending debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // If cleared, call onChange immediately
    if (newValue === "") {
      onChange("")
      return
    }

    // Debounce the onChange callback
    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      />
    </div>
  )
}
