"use client"

import React, { useEffect, useState } from "react"
import { Check, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

function cx(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ")
}

export function InterestedActions({ postId }: { postId: string }) {
  const interestKey = `interest:${postId}`
  const goingKey = `going:${postId}`
  const [interested, setInterested] = useState<boolean>(false)
  const [going, setGoing] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setInterested(localStorage.getItem(interestKey) === '1')
    setGoing(localStorage.getItem(goingKey) === '1')
  }, [interestKey, goingKey])

  const toggleInterested = () => {
    setInterested((v) => {
      const nv = !v
      if (typeof window !== 'undefined') localStorage.setItem(interestKey, nv ? '1' : '0')
      return nv
    })
  }
  const toggleGoing = () => {
    setGoing((v) => {
      const nv = !v
      if (typeof window !== 'undefined') localStorage.setItem(goingKey, nv ? '1' : '0')
      return nv
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant={interested ? 'default' : 'outline'} size="sm" onClick={toggleInterested} aria-label="Me interesa">
        <Heart className={cx(interested ? 'text-red-400' : 'text-muted-foreground')} />
        <span>Me interesa</span>
      </Button>
      <Button variant={going ? 'default' : 'outline'} size="sm" onClick={toggleGoing} aria-label="Asistiré">
        <Check className={cx(going ? 'text-green-400' : 'text-muted-foreground')} />
        <span>Asistiré</span>
      </Button>
    </div>
  )
}
