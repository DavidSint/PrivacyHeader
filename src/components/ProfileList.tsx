import { useRef } from "react"
import { Download, MoreVertical, Plus, Trash2, Upload } from "lucide-react"

import { exportProfiles, importProfilesFromFile } from "@/utils/io"
import type { Profile } from "@/utils/types"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ScrollArea } from "./ui/scroll-area"
import { Switch } from "./ui/switch"

interface ProfileListProps {
  profiles: Profile[]
  onAddProfile: () => void
  onEditProfile: (profile: Profile) => void
  onDeleteProfile: (id: string) => void
  onToggleProfile: (id: string, enabled: boolean) => void
  onImportProfiles: (profiles: Profile[]) => void
}

export function ProfileList({
  profiles,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onToggleProfile,
  onImportProfiles
}: ProfileListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    exportProfiles(profiles)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imported = await importProfilesFromFile(file)
      onImportProfiles(imported)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to import")
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full h-full border-0 shadow-none flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Privacy Header Logo" className="w-8 h-8" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>Privacy Header</CardTitle>
              </div>
              <CardDescription>
                Manage your header profiles.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onAddProfile} size="sm">
              <Plus className="mr-2 h-4 w-4" /> New Profile
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="menu-button">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleImportClick}>
                  <Upload className="mr-2 h-4 w-4" /> Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>No profiles found.</p>
                <p className="text-sm">Create a new profile to get started.</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => onEditProfile(profile)}
                  className="flex items-center justify-between rounded-lg border p-4 shadow-sm transition-all hover:bg-muted hover:shadow-md hover:border-primary/20 cursor-pointer"
                >
                  <div className="flex-1 space-y-1 overflow-hidden mr-4">
                    <p className="font-medium leading-none truncate" title={profile.name}>{profile.name}</p>
                    <p className="text-sm text-muted-foreground truncate" title={profile.urlRegex}>
                      {profile.urlRegex}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {profile.headers.length} header{profile.headers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <Switch
                      checked={profile.enabled}
                      onCheckedChange={(checked) => {
                        onToggleProfile(profile.id, checked);
                      }}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDeleteProfile(profile.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
