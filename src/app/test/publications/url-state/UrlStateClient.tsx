"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function UrlStateClient() {
  const sp = useSearchParams()
  const category = sp.get('category') ?? 'all'
  const q = sp.get('q') ?? ''
  const sort = sp.get('sort') ?? 'recent'
  const page = sp.get('page') ?? '1'

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Prueba URL state</h1>
      <div className="text-muted-foreground">category: {category}</div>
      <div className="text-muted-foreground">q: {q}</div>
      <div className="text-muted-foreground">sort: {sort}</div>
      <div className="text-muted-foreground">page: {page}</div>
      <div className="flex gap-2 pt-2">
        <Link className="underline" href="/test/publications/url-state?category=servicios&q=maquillaje&sort=recent&page=1">Set servicios</Link>
        <Link className="underline" href="/test/publications/url-state?category=productos&q=buzo&sort=recent&page=1">Set productos</Link>
        <Link className="underline" href="/test/publications/url-state?category=usados&q=notebook&sort=recent&page=2">Set usados</Link>
      </div>
    </div>
  )
}
