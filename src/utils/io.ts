import type { Profile } from "./types"
import { exportSchema } from "./validation"

export const exportProfiles = (profiles: Profile[]) => {
  const data = JSON.stringify(profiles) // serialized without whitespace
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "privacy-header-profiles.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const importProfilesFromFile = (file: File): Promise<Profile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        const parsed = JSON.parse(result)

        // Validate
        const validation = exportSchema.safeParse(parsed)
        if (validation.success) {
          resolve(validation.data)
        } else {
          console.error(validation.error)
          reject(new Error("Invalid profile file format."))
        }
      } catch (err) {
        console.error(err)
        reject(new Error("Failed to parse JSON"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
