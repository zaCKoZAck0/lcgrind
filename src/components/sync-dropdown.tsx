"use client"

import { Download, Upload, RefreshCw } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { useAppSelector, useAppDispatch } from "~/hooks/redux"
import { markCompleted } from "~/store/completedProblemsSlice"
import { addNote } from "~/store/problemNotesSlice"
import type { RootState } from "~/store"

interface ExportedData {
  version: number
  exportedAt: number
  completedProblems: RootState["completedProblems"]
  problemNotes: RootState["problemNotes"]
}

const EXPORT_VERSION = 1

export function SyncDropdown() {
  const dispatch = useAppDispatch()
  const completedProblems = useAppSelector((state) => state.completedProblems)
  const problemNotes = useAppSelector((state) => state.problemNotes)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const exportData: ExportedData = {
        version: EXPORT_VERSION,
        exportedAt: Date.now(),
        completedProblems,
        problemNotes,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `lcgrind-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Progress exported successfully!", {
        description: "Your data has been downloaded as a JSON file.",
      })
    } catch {
      toast.error("Export failed", {
        description: "There was an error exporting your data.",
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const validateImportedData = (data: unknown): data is ExportedData => {
    if (!data || typeof data !== "object") return false
    
    const obj = data as Record<string, unknown>
    
    // Check required fields
    if (typeof obj.version !== "number") return false
    if (typeof obj.exportedAt !== "number") return false
    
    // Check completedProblems structure
    if (!obj.completedProblems || typeof obj.completedProblems !== "object") return false
    const completedProblems = obj.completedProblems as Record<string, unknown>
    if (!completedProblems.problems || typeof completedProblems.problems !== "object") return false
    
    // Check problemNotes structure  
    if (!obj.problemNotes || typeof obj.problemNotes !== "object") return false
    const problemNotes = obj.problemNotes as Record<string, unknown>
    if (!problemNotes.notes || typeof problemNotes.notes !== "object") return false
    if (!problemNotes.problemNotes || typeof problemNotes.problemNotes !== "object") return false

    return true
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        if (!validateImportedData(importedData)) {
          toast.error("Invalid file format", {
            description: "The file does not contain valid LC Grind backup data.",
          })
          return
        }

        // Import completed problems (only if not already completed or if imported timestamp is newer)
        let importedProblemsCount = 0
        const problems = importedData.completedProblems.problems
        for (const problemId in problems) {
          const existingProblem = completedProblems.problems[problemId]
          const importedProblem = problems[problemId]
          
          // Only import if the problem is not already completed or if the imported timestamp is newer
          if (!existingProblem || 
              (importedProblem.completedAt && importedProblem.completedAt > existingProblem.completedAt)) {
            dispatch(markCompleted(problemId))
            importedProblemsCount++
          }
        }

        // Import notes (skip duplicates based on problemId, title, and content)
        let importedNotesCount = 0
        const notes = importedData.problemNotes.notes
        const existingNotesValues = Object.values(problemNotes.notes)
        
        for (const noteId in notes) {
          const note = notes[noteId]
          
          // Validate note structure with proper type checks
          if (note && 
              typeof note.problemId === "string" && 
              typeof note.title === "string" && 
              typeof note.content === "string") {
            
            // Check for duplicate notes (same problemId, title, and content)
            const isDuplicate = existingNotesValues.some(
              (existingNote) => 
                existingNote.problemId === note.problemId &&
                existingNote.title === note.title &&
                existingNote.content === note.content
            )
            
            if (!isDuplicate) {
              dispatch(addNote({
                problemId: note.problemId,
                title: note.title,
                content: note.content,
                color: typeof note.color === "string" ? note.color : undefined,
              }))
              importedNotesCount++
            }
          }
        }

        toast.success("Progress imported successfully!", {
          description: `Imported ${importedProblemsCount} completed problems and ${importedNotesCount} notes.`,
        })
      } catch {
        toast.error("Import failed", {
          description: "There was an error reading the file. Please make sure it's a valid JSON file.",
        })
      }
    }

    reader.onerror = () => {
      toast.error("Import failed", {
        description: "There was an error reading the file.",
      })
    }

    reader.readAsText(file)
    
    // Reset the input so the same file can be selected again
    event.target.value = ""
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-label="Import backup file"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="neutral" size="icon" aria-label="Sync progress">
            <RefreshCw className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sync Progress</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportClick}>
            <Upload className="mr-2 size-4" />
            Import Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
