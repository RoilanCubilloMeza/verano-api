/**
 * Ejemplo de uso del API desde el cliente (React/Next.js)
 */

import React from 'react'

// Tipos
interface UserData {
  userFirebaseUID: string
  userEmail: string
  userName?: string
  userPhotoURL?: string
  userAppVersion: string
}

interface User {
  userId: number
  userEmail: string
  userName: string | null
  userPhotoURL: string | null
}

// 1. Crear un usuario y obtener token
export async function registerUser(userData: UserData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const result = await response.json()
  
  if (result.success) {
    // Guardar token en localStorage o contexto
    localStorage.setItem('authToken', result.data.token)
    return result.data
  }
  
  throw new Error(result.error)
}

// 2. Buscar vehículos con filtros
export async function searchVehicles(filters: {
  page?: number
  limit?: number
  brandID?: number
  categoryID?: number
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  sortBy?: 'price' | 'year' | 'brand'
  sortOrder?: 'asc' | 'desc'
}) {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value))
    }
  })

  const response = await fetch(`/api/vehicles?${params.toString()}`)
  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 3. Obtener detalles de un vehículo
export async function getVehicleDetails(vehicleID: number) {
  const response = await fetch(`/api/vehicles/${vehicleID}`)
  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 4. Crear opinión (requiere autenticación)
export async function createOpinion(
  vehicleID: number,
  data: {
    opinionRate: number
    opinionComment?: string
  }
) {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch(`/api/vehicles/${vehicleID}/opinions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 5. Agregar a favoritos (requiere autenticación)
export async function addToFavorites(userId: number, vehicleID: number) {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch(`/api/users/${userId}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ vehicleID }),
  })

  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 6. Crear comunidad (requiere autenticación)
export async function createCommunity(data: {
  communityName: string
  communityLocationLat?: string
  communityLocationLon?: string
}) {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch('/api/communities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 7. Unirse a comunidad (requiere autenticación)
export async function joinCommunity(communityID: number) {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch(`/api/communities/${communityID}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 8. Publicar mensaje en comunidad (requiere autenticación)
export async function postCommunityMessage(
  communityID: number,
  messageContent: string
) {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch(`/api/communities/${communityID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messageContent }),
  })

  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 9. Obtener estadísticas (requiere autenticación)
export async function getStats() {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch('/api/stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 10. Obtener marcas (público)
export async function getBrands() {
  const response = await fetch('/api/brands')
  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// 11. Obtener categorías (público)
export async function getCategories() {
  const response = await fetch('/api/categories')
  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  
  throw new Error(result.error)
}

// Hook personalizado para React (ejemplo)
export function useAuth() {
  const [token, setToken] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      setToken(savedToken)
      // Aquí podrías decodificar el JWT para obtener info del usuario
    }
  }, [])

  const login = async (userData: UserData) => {
    const result = await registerUser(userData)
    setToken(result.token)
    setUser(result.user)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout, isAuthenticated: !!token }
}
