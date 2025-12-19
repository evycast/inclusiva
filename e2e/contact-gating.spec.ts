import { test, expect } from '@playwright/test'

function makeDetailResponse(id: string, vis: 'gated' | 'public', flow: 'seller_contacts' | 'buyer_contacts_first' = 'buyer_contacts_first') {
  return {
    data: {
      id,
      category: 'servicios',
      title: 'Terapia inclusiva',
      description: 'Sesiones de terapia afirmativa',
      image: '/images/placeholder.png',
      author: 'Alice',
      authorAvatar: '/images/avatar.png',
      location: 'CABA',
      priceLabel: 'A convenir',
      date: new Date().toISOString(),
      status: 'approved',
      contactVisibility: vis,
      contactFlow: flow,
      hasContact: true,
      socials: [],
      payment: ['efectivo'],
      barterAccepted: false,
      mode: 'in_person',
      tags: ['terapia', 'inclusiva'],
      ratingCount: 0,
      rating: 0,
    },
  }
}

test.describe('Contact gating', () => {
  test('flujo 1: vendedor contacta al comprador, se solicita contacto y no se revelan datos', async ({ page }) => {
    const id = 'test-seller-contacts'
    await page.route(`**/api/posts/${id}`, (route) => {
      route.fulfill({ json: makeDetailResponse(id, 'public', 'seller_contacts') })
    })
    await page.route(`**/api/posts/${id}/contact`, (route) => {
      const method = route.request().method()
      if (method === 'GET') return route.fulfill({ status: 403, json: { error: 'contact_private' } })
      return route.fulfill({ status: 200, json: { ok: true } })
    })

    await page.goto(`/publicaciones/${id}`)
    await page.locator('text=Acepto y asumo la responsabilidad').click()
    await expect(page.locator('text=Solicitar contacto')).toBeVisible()
    await page.locator('text=Solicitar contacto').click()
    await page.getByLabel('Nombre').fill('Juan')
    await page.getByLabel('Teléfono').fill('5491112345678')
    await page.getByLabel('Email (opcional)').fill('juan@example.com')
    await page.getByLabel('Mensaje (opcional)').fill('Hola, me interesa tu servicio')
    await page.locator('text=Enviar').click()
    await expect(page.locator('text=Solicitud enviada. El vendedor se contactará a la brevedad.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toHaveCount(0)
  })

  test('flujo 2: datos públicos requieren datos básicos antes de revelar', async ({ page }) => {
    const id = 'test-public'
    let allowContacts = false
    await page.route(`**/api/posts/${id}`, (route) => {
      route.fulfill({ json: makeDetailResponse(id, 'public', 'buyer_contacts_first') })
    })
    await page.route(`**/api/posts/${id}/contact`, (route) => {
      const method = route.request().method()
      if (method === 'POST') {
        allowContacts = true
        return route.fulfill({ status: 200, json: { data: { socials: [{ name: 'instagram', url: 'https://instagram.com/inclusiva' }] } } })
      }
      if (!allowContacts) return route.fulfill({ status: 403, json: { error: 'contact_gated_required' } })
      return route.fulfill({ json: { data: { socials: [{ name: 'instagram', url: 'https://instagram.com/inclusiva' }] } } })
    })

    await page.goto(`/publicaciones/${id}`)
    await page.locator('text=Acepto y asumo la responsabilidad').click()
    await expect(page.getByText('Para ver los datos de contacto, completá tus datos básicos.')).toBeVisible()
    await page.locator('text=Ver datos de contacto').click()
    await page.getByLabel('Nombre').fill('Juana')
    await page.getByLabel('Email').fill('juana@example.com')
    await page.getByLabel('Teléfono').fill('5491112345678')
    await page.locator('text=Enviar').click()
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible()
    await expect(page.getByText('Instagram')).toBeVisible()
  })

  test('flujo 3: usuario logueado aprobado ve contacto sin ingresar datos', async ({ page }) => {
    const id = 'test-logged'
    await page.route('**/api/auth/status', (route) => {
      route.fulfill({ json: { ok: true, role: 'user', userId: 'u1', user: { name: 'Alice', email: 'alice@example.com', phone: '5491112345678', status: 'approved' } } })
    })
    await page.route(`**/api/posts/${id}`, (route) => {
      route.fulfill({ json: makeDetailResponse(id, 'public') })
    })
    await page.route(`**/api/posts/${id}/contact`, (route) => {
      return route.fulfill({ json: { data: { socials: [{ name: 'email', url: 'alice@example.com' }] } } })
    })

    await page.goto(`/publicaciones/${id}`)
    await page.locator('text=Acepto y asumo la responsabilidad').click()
    await page.locator('text=Ver datos de contacto').click()
    await page.locator('text=Enviar').click()
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible()
    await expect(page.getByText('alice@example.com')).toBeVisible()
  })
})
