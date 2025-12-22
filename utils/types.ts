// Tipos de respuesta API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos para vehículos con relaciones
export interface VehicleWithDetails {
  vehicleID: number
  vehicleYear: number
  vehiclePrice: number
  brand: {
    brandID: number
    brandBrand: string
  }
  model: {
    modelID: number
    modelDescription: string
  }
  version: {
    versionID: number
    versionDescription: string
  }
  category: {
    categoryID: number
    categoryDescription: string
  }
  opinions?: Array<{
    opinionID: number
    opinionRate: number
    opinionComment: string | null
    opinionDate: Date
  }>
}

// Tipos para comunidades
export interface CommunityWithUsers {
  communityID: number
  communityName: string
  communityLocationLat: string | null
  communityLocationLon: string | null
  userCount: number
  messageCount: number
}

// Tipos para estadísticas
export interface VehicleStats {
  averageRating: number
  totalOpinions: number
  priceRange: {
    min: number
    max: number
    average: number
  }
}

 interface UserStats {
  totalOpinions: number
  totalFavorites: number
  totalComparisons: number
  communitiesJoined: number
}

export interface GoogleUserInfo {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  picture?: string
}
