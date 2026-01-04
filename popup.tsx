import { useStorage } from "@plasmohq/storage/hook"
import { useState } from "react"
import "./src/style.css"
import { Storage } from "@plasmohq/storage"

import type { Profile } from "./src/types"
import { ProfileEditor } from "./src/components/profile-editor"
import { ProfileList } from "./src/components/profile-list"

const storage = new Storage({
  area: "local"
})

function IndexPopup() {
  const [profiles, setProfiles] = useStorage<Profile[]>({
    key: "profiles",
    instance: storage
  }, [])
  const [view, setView] = useState<"list" | "edit">("list")
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>()

  const handleAddProfile = () => {
    setEditingProfile(undefined)
    setView("edit")
  }

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile)
    setView("edit")
  }

  const handleSaveProfile = (profile: Profile) => {
    if (editingProfile) {
      // Update existing
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? profile : p))
      )
    } else {
      // Add new
      setProfiles((prev) => [...prev, profile])
    }
    setView("list")
    setEditingProfile(undefined)
  }

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggleProfile = (id: string, enabled: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p))
    )
  }

  return (
    <div className="w-[500px] h-[550px] bg-background text-foreground flex flex-col">
      {view === "list" && (
        <ProfileList
          profiles={profiles || []}
          onAddProfile={handleAddProfile}
          onEditProfile={handleEditProfile}
          onDeleteProfile={handleDeleteProfile}
          onToggleProfile={handleToggleProfile}
        />
      )}
      {view === "edit" && (
        <ProfileEditor
          profile={editingProfile}
          onSave={handleSaveProfile}
          onCancel={() => {
            setView("list")
            setEditingProfile(undefined)
          }}
        />
      )}
    </div>
  )
}

export default IndexPopup
