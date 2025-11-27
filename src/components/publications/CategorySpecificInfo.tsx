"use client"

import type { PostInput } from "@/lib/validation/post"
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaLaptop,
  FaUsers,
  FaInfoCircle,
  FaMedal,
  FaClock,
  FaTag,
  FaBoxOpen,
  FaShieldAlt,
  FaHistory,
  FaSignal,
  FaMoneyBill,
} from "react-icons/fa"

function formatDateTime(iso?: string): string | null {
  if (!iso) return null
  try {
    const d = new Date(iso)
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso ?? null
  }
}

export function CategorySpecificInfo({ post }: { post: PostInput }) {
  switch (post.category) {
    case "eventos": {
      const p = post
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Detalles del Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <FaCalendarAlt className="text-blue-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Inicio</p>
                    <p className="text-slate-400 text-sm">{formatDateTime(p.startDate)}</p>
                  </div>
                </div>
                {p.endDate && (
                  <div className="flex items-center gap-4">
                    <FaCalendarCheck className="text-green-400" />
                    <div>
                      <p className="text-slate-200 font-medium">Fin</p>
                      <p className="text-slate-400 text-sm">{formatDateTime(p.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <FaMapMarkerAlt className="text-red-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Lugar</p>
                    <p className="text-slate-400 text-sm">{p.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FaLaptop className="text-purple-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Modalidad</p>
                    <p className="text-slate-400 text-sm capitalize">{p.mode}</p>
                  </div>
                </div>
                {p.capacity && (
                  <div className="flex items-center gap-4">
                    <FaUsers className="text-cyan-400" />
                    <div>
                      <p className="text-slate-200 font-medium">Capacidad</p>
                      <p className="text-slate-400 text-sm">{p.capacity} personas</p>
                    </div>
                  </div>
                )}
                {p.organizer && (
                  <div className="flex items-center gap-4">
                    <FaInfoCircle className="text-amber-400" />
                    <div>
                      <p className="text-slate-200 font-medium">Organiza</p>
                      <p className="text-slate-400 text-sm">{p.organizer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    case "servicios": {
      const p = post
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Detalles del Servicio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.experienceYears && (
                <div className="flex items-center gap-4">
                  <FaMedal className="text-yellow-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Experiencia</p>
                    <p className="text-slate-400 text-sm">{p.experienceYears} años</p>
                  </div>
                </div>
              )}
              {p.availability && (
                <div className="flex items-center gap-4">
                  <FaClock className="text-green-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Disponibilidad</p>
                    <p className="text-slate-400 text-sm">{p.availability}</p>
                  </div>
                </div>
              )}
              {p.serviceArea && (
                <div className="flex items-center gap-4">
                  <FaMapMarkerAlt className="text-red-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Zona de servicio</p>
                    <p className="text-slate-400 text-sm">{p.serviceArea}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case "productos": {
      const p = post
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Detalles del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <FaTag className="text-blue-400" />
                <div>
                  <p className="text-slate-200 font-medium">Condición</p>
                  <p className="text-slate-400 text-sm capitalize">{p.condition}</p>
                </div>
              </div>
              {p.stock && (
                <div className="flex items-center gap-4">
                  <FaBoxOpen className="text-green-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Stock</p>
                    <p className="text-slate-400 text-sm">{p.stock} unidades</p>
                  </div>
                </div>
              )}
              {p.warranty && (
                <div className="flex items-center gap-4">
                  <FaShieldAlt className="text-purple-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Garantía</p>
                    <p className="text-slate-400 text-sm">{p.warranty}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case "usados": {
      const p = post
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Detalles del Producto Usado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <FaTag className="text-orange-400" />
                <div>
                  <p className="text-slate-200 font-medium">Condición</p>
                  <p className="text-slate-400 text-sm capitalize">{p.condition}</p>
                </div>
              </div>
              {p.usageTime && (
                <div className="flex items-center gap-4">
                  <FaHistory className="text-cyan-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Tiempo de uso</p>
                    <p className="text-slate-400 text-sm">{p.usageTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case "cursos": {
      const p = post
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Detalles del Curso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <FaLaptop className="text-purple-400" />
                <div>
                  <p className="text-slate-200 font-medium">Modalidad</p>
                  <p className="text-slate-400 text-sm capitalize">{p.mode}</p>
                </div>
              </div>
              {p.duration && (
                <div className="flex items-center gap-4">
                  <FaClock className="text-green-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Duración</p>
                    <p className="text-slate-400 text-sm">{p.duration}</p>
                  </div>
                </div>
              )}
              {p.schedule && (
                <div className="flex items-center gap-4">
                  <FaCalendarAlt className="text-blue-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Horarios</p>
                    <p className="text-slate-400 text-sm">{p.schedule}</p>
                  </div>
                </div>
              )}
              {p.level && (
                <div className="flex items-center gap-4">
                  <FaSignal className="text-amber-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Nivel</p>
                    <p className="text-slate-400 text-sm capitalize">{p.level}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case "pedidos": {
      const p = post
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Detalles del Pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.neededBy && (
                <div className="flex items-center gap-4">
                  <FaCalendarAlt className="text-red-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Necesario para</p>
                    <p className="text-slate-400 text-sm">{p.neededBy}</p>
                  </div>
                </div>
              )}
              {p.budgetRange && (
                <div className="flex items-center gap-4">
                  <FaMoneyBill className="text-green-400" />
                  <div>
                    <p className="text-slate-200 font-medium">Presupuesto</p>
                    <p className="text-slate-400 text-sm">{p.budgetRange}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    default:
      return null
  }
}

