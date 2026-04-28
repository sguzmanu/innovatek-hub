export type BrandStatus = "activa" | "en_desarrollo" | "pausada"
export type HealthScore = "excelente" | "bueno" | "regular" | "critico"

export interface Brand {
  slug: string
  name: string
  description: string
  category: string
  status: BrandStatus
  health: HealthScore
  healthScore: number
  logo?: string
  color: string
  lastReport?: string
  nextReview?: string
  odooConnected: boolean
  odooModel?: string
  kpis: {
    ventas?: number
    meta?: number
    crecimiento?: number
  }
}

export interface BrandReport {
  id: string
  brandSlug: string
  title: string
  date: string
  period: string
  summary: string
  highlights: string[]
  concerns: string[]
  fileUrl?: string
}

export interface TrackingPlan {
  id: string
  brandSlug: string
  title: string
  objective: string
  currentLevel: string
  nextLevel: string
  deadline: string
  milestones: {
    id: string
    title: string
    deadline: string
    status: "pending" | "in_progress" | "completed"
  }[]
}

export interface Audit {
  id: string
  brandSlug: string
  type: "digital" | "producto" | "financiero" | "operacional" | "marca"
  title: string
  date: string
  score: number
  status: "pendiente" | "en_progreso" | "completado"
  findings: string[]
  recommendations: string[]
}

export interface Skill {
  id: string
  name: string
  description: string
  version: string
  category: "diseño" | "datos" | "automatizacion" | "marca" | "general"
  createdAt: string
  updatedAt: string
  fileUrl?: string
  active: boolean
  tags: string[]
}

export interface Automation {
  id: string
  name: string
  description: string
  trigger: string
  frequency: string
  status: "activa" | "pausada" | "error"
  lastRun?: string
  nextRun?: string
  tool: string
  category: string
}

export interface ApiConnection {
  id: string
  name: string
  service: string
  status: "conectada" | "desconectada" | "error"
  lastSync?: string
  endpoint?: string
  description: string
  usedBy: string[]
  category: "erp" | "ai" | "analytics" | "comunicacion" | "storage" | "otro"
}
