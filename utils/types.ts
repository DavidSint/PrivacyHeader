export interface Header {
  id: string
  name: string
  value: string
}

export interface Profile {
  id: string
  name: string
  urlRegex: string
  headers: Header[]
  enabled: boolean
}

export interface ProfileState {
  profiles: Profile[]
}
