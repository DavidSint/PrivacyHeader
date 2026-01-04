import React from "react"
import { Edit2, Plus, Trash2 } from "lucide-react"

import type { Profile } from "@/utils/types"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Switch } from "./ui/switch"

interface ProfileListProps {
  profiles: Profile[]
  onAddProfile: () => void
  onEditProfile: (profile: Profile) => void
  onDeleteProfile: (id: string) => void
  onToggleProfile: (id: string, enabled: boolean) => void
}

export function ProfileList({
  profiles,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onToggleProfile
}: ProfileListProps) {
  return (
    <Card className="w-full h-full border-0 shadow-none flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Privacy Header</CardTitle>
            <CardDescription>
              Manage your header profiles.
            </CardDescription>
          </div>
          <Button onClick={onAddProfile} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
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
                  className="flex items-center justify-between rounded-lg border p-4 shadow-sm transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1 overflow-hidden mr-4">
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
                      onCheckedChange={(checked) =>
                        onToggleProfile(profile.id, checked)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditProfile(profile)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteProfile(profile.id)}
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
