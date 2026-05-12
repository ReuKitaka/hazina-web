import api from '@/lib/api'
import { AuthResponse, LoginRequest } from '@/types'

export const authService = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/api/auth/login', data).then(r => r.data),
  register: (data: { firstName: string; lastName: string; email: string; password: string; role: string }) =>
    api.post<AuthResponse>('/api/auth/register', data).then(r => r.data),
}
