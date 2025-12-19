"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { PostInput } from "@/lib/validation/post"
import { Banknote, CreditCard, Landmark, Wallet, Bitcoin, Handshake } from "lucide-react"

const paymentMeta: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  cash: { icon: Banknote, className: "text-green-600", label: "Efectivo" },
  debit: { icon: CreditCard, className: "text-blue-500", label: "Débito" },
  credit: { icon: CreditCard, className: "text-purple-500", label: "Crédito" },
  transfer: { icon: Landmark, className: "text-cyan-600", label: "Transferencia" },
  mercadopago: { icon: Wallet, className: "text-sky-500", label: "Billetera virtual" },
  crypto: { icon: Bitcoin, className: "text-orange-500", label: "Cripto" },
}

type PaymentList = NonNullable<PostInput["payment"]>

export function PaymentMethodsCard({ payment, barterAccepted }: { payment: PaymentList; barterAccepted?: boolean }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Métodos de pago</h3>
        <div className="space-y-3">
          {payment.map((method) => {
            const meta = paymentMeta[method]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <div key={method} className="flex items-center gap-4 p-2 rounded bg-muted/50 text-sm">
                <Icon className={`${meta.className}`} />
                <span className="text-foreground">{meta.label}</span>
              </div>
            )
          })}
          {barterAccepted && (
            <div className="flex items-center gap-4 p-2 rounded bg-muted/50 text-sm">
              <Handshake className="text-amber-500" />
              <span className="text-foreground">Acepta canje</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
