"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PostInput } from "@/lib/validation/post"
import {
  FaExternalLinkAlt,
  FaWhatsapp,
  FaInstagram,
  FaTelegramPlane,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa"

const contactMeta: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  whatsapp: { icon: FaWhatsapp, className: "text-green-400", label: "WhatsApp" },
  instagram: { icon: FaInstagram, className: "text-pink-400", label: "Instagram" },
  telegram: { icon: FaTelegramPlane, className: "text-blue-400", label: "Telegram" },
  email: { icon: FaEnvelope, className: "text-slate-400", label: "Email" },
  website: { icon: FaGlobe, className: "text-cyan-400", label: "Sitio web" },
}

type SocialItem = NonNullable<PostInput["socials"]>[number]

export function ContactCard({ socials }: { socials: SocialItem[] }) {
  const [copied, setCopied] = useState(false)

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Contacto</h3>
        <div className="space-y-3 mb-6">
          {socials.map(({ name, url }, idx) => {
            const meta = contactMeta[name] || {
              icon: FaExternalLinkAlt,
              className: "text-slate-400",
              label: name,
            }
            const Icon = meta.icon
            const isLink = typeof url === "string" && url.toLowerCase().startsWith("http")

            if (isLink) {
              return (
                <a
                  key={`${name}-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                >
                  <Icon className={`${meta.className} text-lg`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-100 text-sm font-medium">{meta.label}</div>
                  </div>
                  <FaExternalLinkAlt className="text-slate-400" aria-label="Abrir página externa" />
                </a>
              )
            }

            return (
              <div
                key={`${name}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              >
                <Icon className={`${meta.className} text-lg`} />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-100 text-sm truncate">{url}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-200 border-slate-600 hover:bg-slate-600"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch {}
                  }}
                >
                  Copiar
                </Button>
                {copied && <span className="ml-2 text-xs text-green-400">Copiado</span>}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

