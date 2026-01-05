import React, { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { z } from "zod"

import type { Header, Profile } from "@/utils/types"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ScrollArea } from "./ui/scroll-area"

interface ProfileEditorProps {
  profile?: Profile
  onSave: (profile: Profile) => void
  onCancel: () => void
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

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const [name, setName] = useState(profile?.name || "")
  const [urlRegex, setUrlRegex] = useState(profile?.urlRegex || "^https?://.*")
  const [headers, setHeaders] = useState<Header[]>(
    profile?.headers || [{ id: crypto.randomUUID(), name: "", value: "" }]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddHeader = () => {
    setHeaders([...headers, { id: crypto.randomUUID(), name: "", value: "" }])
  }

  const handleRemoveHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id))
  }

  const handleHeaderChange = (id: string, field: "name" | "value", value: string) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    )
  }

  const handleSave = () => {
    const newProfile = {
      id: profile?.id || crypto.randomUUID(),
      name,
      urlRegex,
      headers: headers.filter(h => h.name.trim() !== "" || h.value.trim() !== ""), // Filter out completely empty ones if user wants, or validate
      enabled: profile?.enabled ?? true
    }

    try {
      // Validate
      // We check if headers are valid (name and value present)
      const validHeaders = newProfile.headers.filter(h => h.name && h.value)
      // Check if we have headers that are partially filled

      const result = profileSchema.parse({
          ...newProfile,
          headers: validHeaders
      })

      onSave({
          ...result,
          id: newProfile.id,
          enabled: newProfile.enabled,
          headers: validHeaders.map(h => ({...h, id: h.id || crypto.randomUUID()})) as Header[]
      })
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0] === "headers") {
              newErrors["headers"] = "All headers must have a name and value"
          } else {
              newErrors[String(err.path[0])] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <Card className="w-full h-full border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
            <CardTitle>{profile ? "Edit Profile" : "New Profile"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-4 w-4" />
            </Button>
        </div>
        <CardDescription>
          Configure headers to be injected for requests matching the URL regex.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-0">
        <div className="space-y-2">
          <Label htmlFor="name">Profile Name</Label>
          <Input
            id="name"
            placeholder="e.g. Staging Environment"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="regex">URL Regex</Label>
          <Input
            id="regex"
            placeholder="e.g. https://staging\.example\.com/.*"
            value={urlRegex}
            onChange={(e) => setUrlRegex(e.target.value)}
          />
          {errors.urlRegex && <p className="text-xs text-destructive">{errors.urlRegex}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Headers</Label>
            <Button variant="outline" size="sm" onClick={handleAddHeader} className="h-7 px-2">
              <Plus className="mr-1 h-3 w-3" /> Add Header
            </Button>
          </div>
          {errors.headers && <p className="text-xs text-destructive">{errors.headers}</p>}

          <ScrollArea className="h-[200px] w-full rounded-md border">
            <div className="p-4 space-y-3">
              {headers.map((header, _index) => (
                <div key={header.id} className="flex items-start gap-2">
                  <div className="flex flex-1 gap-2">
                    <Input
                      placeholder="Header Name"
                      value={header.name}
                      onChange={(e) =>
                        handleHeaderChange(header.id, "name", e.target.value)
                      }
                      className="h-8 flex-1"
                    />
                    <Input
                      placeholder="Header Value"
                      value={header.value}
                      onChange={(e) =>
                        handleHeaderChange(header.id, "value", e.target.value)
                      }
                      className="h-8 flex-2"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleRemoveHeader(header.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {headers.length === 0 && (
                 <div className="text-center text-sm text-muted-foreground py-4">
                    No headers added.
                 </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="pt-4 justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Profile</Button>
      </CardFooter>
    </Card>
  )
}
