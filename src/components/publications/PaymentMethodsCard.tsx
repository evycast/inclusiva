"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { PostInput } from "@/lib/validation/post"
import { FaMoneyBill, FaCreditCard, FaUniversity, FaWallet, FaBitcoin, FaHandshake } from "react-icons/fa"

const paymentMeta: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  cash: { icon: FaMoneyBill, className: "text-green-400", label: "Efectivo" },
  debit: { icon: FaCreditCard, className: "text-blue-400", label: "Débito" },
  credit: { icon: FaCreditCard, className: "text-purple-400", label: "Crédito" },
  transfer: { icon: FaUniversity, className: "text-cyan-400", label: "Transferencia" },
  mercadopago: { icon: FaWallet, className: "text-sky-400", label: "Billetera virtual" },
  crypto: { icon: FaBitcoin, className: "text-orange-400", label: "Cripto" },
  barter: { icon: FaHandshake, className: "text-amber-400", label: "Canje" },
  all: { icon: FaMoneyBill, className: "text-slate-400", label: "Todos los medios" },
}

type PaymentList = NonNullable<PostInput["payment"]>

export function PaymentMethodsCard({ payment, barterAccepted }: { payment: PaymentList; barterAccepted?: boolean }) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Métodos de pago</h3>
        <div className="space-y-3">
          {payment.map((method) => {
            const meta = paymentMeta[method]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <div key={method} className="flex items-center gap-4 p-2 rounded bg-slate-700/30 text-sm">
                <Icon className={`${meta.className}`} />
                <span className="text-slate-300">{meta.label}</span>
              </div>
            )
          })}
          {barterAccepted && !payment.includes("barter") && (
            <div className="flex items-center gap-4 p-2 rounded bg-slate-700/30 text-sm">
              <FaHandshake className="text-amber-400" />
              <span className="text-slate-300">Acepta canje</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

