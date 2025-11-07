export interface Launch {
  id: string
  name: string
  status: {
    id: number
    name: string
    abbrev: string
    description: string
  }
  net: string // Network Estimated Time
  window_end: string
  window_start: string
  probability: number | null
  holdreason: string | null
  failreason: string | null
  hashtag: string | null
  launch_service_provider: {
    id: number
    name: string
    type: string
    url: string
  }
  rocket: {
    id: number
    configuration: {
      id: number
      name: string
      family: string
      full_name: string
      variant: string
      description: string
      url: string
      image_url: string | null
    }
  }
  mission: {
    id: number
    name: string
    description: string
    type: string
    orbit: {
      id: number
      name: string
      abbrev: string
    }
  } | null
  pad: {
    id: number
    name: string
    latitude: string
    longitude: string
    location: {
      id: number
      name: string
      country_code: string
    }
  }
  webcast_live: boolean
  image: string | null
  infographic: string | null
  program: Array<{
    id: number
    name: string
    description: string
    image_url: string
  }>
  updates: Array<{
    id: number
    comment: string
    created_on: string
  }>
}

export interface LaunchesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Launch[]
}
