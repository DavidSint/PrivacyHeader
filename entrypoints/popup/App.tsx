import { useState, useEffect } from "react";
import "./style.css";
import { storage } from "wxt/storage";

import type { Profile } from "@/utils/types";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ProfileList } from "@/components/ProfileList";

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [view, setView] = useState<"list" | "edit">("list");
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>();
  const [loading, setLoading] = useState(true);

  // Load profiles from storage on mount
  useEffect(() => {
    async function loadProfiles() {
      const stored = await storage.getItem<Profile[]>("local:profiles");
      setProfiles(stored || []);
      setLoading(false);
    }
    loadProfiles();

    // Watch for changes (if updated from elsewhere, though unlikely for this simple popup)
    const unwatch = storage.watch<Profile[]>("local:profiles", (newProfiles) => {
      if (newProfiles) {
        setProfiles(newProfiles);
      }
    });

    return () => {
      unwatch();
    };
  }, []);

  const saveProfiles = async (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    await storage.setItem("local:profiles", newProfiles);
  };

  const handleAddProfile = () => {
    setEditingProfile(undefined);
    setView("edit");
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setView("edit");
  };

  const handleSaveProfile = async (profile: Profile) => {
    let newProfiles;
    if (editingProfile) {
      // Update existing
      newProfiles = profiles.map((p) => (p.id === profile.id ? profile : p));
    } else {
      // Add new
      newProfiles = [...profiles, profile];
    }
    await saveProfiles(newProfiles);
    setView("list");
    setEditingProfile(undefined);
  };

  const handleDeleteProfile = async (id: string) => {
    const newProfiles = profiles.filter((p) => p.id !== id);
    await saveProfiles(newProfiles);
  };

  const handleToggleProfile = async (id: string, enabled: boolean) => {
    const newProfiles = profiles.map((p) => (p.id === id ? { ...p, enabled } : p));
    await saveProfiles(newProfiles);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full w-full">Loading...</div>;
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
            setView("list");
            setEditingProfile(undefined);
          }}
        />
      )}
    </div>
  );
}

export default App;
