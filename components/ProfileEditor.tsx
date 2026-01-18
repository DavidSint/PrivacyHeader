import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Trash2 } from "lucide-react"
import { z } from "zod"

import type { Header, Profile } from "@/utils/types"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ScrollArea } from "./ui/scroll-area"

interface ProfileEditorProps {
  profile?: Profile
  onSave: (profile: Profile) => void
  onClose: () => void
}

const headerSchema = z.object({
  name: z.string().min(1, "Header name is required"),
  value: z.string().min(1, "Header value is required")
})

const profileSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  urlRegex: z.string().min(1, "URL Regex is required").refine((val) => {
    try {
      new RegExp(val)
      return true
    } catch {
      return false
    }
  }, "Invalid Regular Expression"),
  headers: z.array(headerSchema)
})

const createEmptyHeader = (): Header => ({
  id: crypto.randomUUID(),
  name: "",
  value: ""
})

const isHeaderEmpty = (header: Header): boolean =>
  header.name.trim() === "" && header.value.trim() === ""

const isHeaderComplete = (header: Header): boolean =>
  header.name.trim() !== "" && header.value.trim() !== ""

export function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [profileId] = useState(() => profile?.id || crypto.randomUUID())
  const [name, setName] = useState(profile?.name || "")
  const [urlRegex, setUrlRegex] = useState(profile?.urlRegex || "^https?://.*")
  const [headers, setHeaders] = useState<Header[]>(() => {
    const existingHeaders = profile?.headers || []
    return [...existingHeaders, createEmptyHeader()]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isInitialMount = useRef(true)

  const getFilledHeaders = useCallback((): Header[] => {
    return headers.filter((h) => !isHeaderEmpty(h))
  }, [headers])

  const attemptSave = useCallback(() => {
    const filledHeaders = getFilledHeaders()
    const validHeaders = filledHeaders.filter(isHeaderComplete)

    const newProfile = {
      id: profileId,
      name,
      urlRegex,
      headers: validHeaders,
      enabled: profile?.enabled ?? true
    }

    const result = profileSchema.safeParse({
      ...newProfile,
      headers: validHeaders
    })

    if (result.success) {
      onSave({
        ...result.data,
        id: profileId,
        enabled: newProfile.enabled,
        headers: validHeaders.map(h => ({ ...h, id: h.id || crypto.randomUUID() })) as Header[]
      })
      setErrors({})
    } else {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0] === "headers") {
          newErrors["headers"] = "All headers must have a name and value"
        } else {
          newErrors[String(err.path[0])] = err.message
        }
      })
      setErrors(newErrors)
    }
  }, [profileId, name, urlRegex, profile?.enabled, getFilledHeaders, onSave])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      attemptSave()
    }, 500)

    return () => clearTimeout(timer)
  }, [name, urlRegex, headers, attemptSave])

  const handleRemoveHeader = (id: string, index: number) => {
    const isLastRow = index === headers.length - 1
    if (isLastRow) return

    setHeaders(headers.filter((h) => h.id !== id))
  }

  const handleHeaderChange = (id: string, field: "name" | "value", value: string, index: number) => {
    const isLastRow = index === headers.length - 1
    const updatedHeaders = headers.map((h) =>
      h.id === id ? { ...h, [field]: value } : h
    )

    if (isLastRow) {
      const lastHeader = updatedHeaders[updatedHeaders.length - 1]
      if (!isHeaderEmpty(lastHeader)) {
        updatedHeaders.push(createEmptyHeader())
      }
    }

    setHeaders(updatedHeaders)
  }

  return (
    <Card className="w-full h-full border-0 shadow-none flex flex-col">
      <CardHeader className="p-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {profile ? "Edit Profile" : "New Profile"}
            </CardTitle>
            <CardDescription className="text-xs">
              Changes are saved automatically.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Profile Name</Label>
          <Input
            id="name"
            placeholder="e.g. Staging Environment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
          {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="regex" className="text-xs">URL Regex</Label>
          <Input
            id="regex"
            placeholder="e.g. https://staging\.example\.com/.*"
            value={urlRegex}
            onChange={(e) => setUrlRegex(e.target.value)}
            className="h-9"
          />
          {errors.urlRegex && <p className="text-[10px] text-destructive">{errors.urlRegex}</p>}
        </div>

        <div className="space-y-2 pt-1">
          <Label className="text-xs">Headers</Label>
          {errors.headers && <p className="text-[10px] text-destructive">{errors.headers}</p>}

          <ScrollArea className="h-[180px] w-full rounded-md border">
            <div className="p-4 space-y-3">
              {headers.map((header, index) => {
                const isLastRow = index === headers.length - 1
                return (
                  <div key={header.id} className="flex items-start gap-2">
                    <div className="flex flex-1 gap-2">
                      <Input
                        placeholder="Header Name"
                        value={header.name}
                        onChange={(e) =>
                          handleHeaderChange(header.id, "name", e.target.value, index)
                        }
                        className="h-8 flex-1"
                      />
                      <Input
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) =>
                          handleHeaderChange(header.id, "value", e.target.value, index)
                        }
                        className="h-8 flex-2"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 shrink-0 ${isLastRow ? "invisible" : "text-destructive hover:text-destructive"}`}
                      onClick={() => handleRemoveHeader(header.id, index)}
                      disabled={isLastRow}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
