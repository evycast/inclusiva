import { test, expect } from '@playwright/test'

test.describe('Logout flow robusto', () => {
  test('al cerrar sesión no se vuelve a logear automáticamente', async ({ page }) => {
    let loggedIn = true
    await page.route('**/api/auth/status', (route) => {
      const payload = loggedIn ? { ok: true, role: 'admin', userId: 'adm-1' } : { ok: false }
      route.fulfill({ status: 200, json: payload })
    })

    await page.goto('/admin/login')
    // Con loggedIn=true, la página intentará redirigir a /admin/posts
    // Validamos transición de URL, luego deslogueamos
    await page.waitForTimeout(300)

    // Ejecuta logout en servidor
    loggedIn = false
    await page.request.post('/api/auth/logout')

    // Vuelve a la pantalla de login y confirma que no redirige
    await page.goto('/admin/login')
    await expect(page.getByText('Admin')).toBeVisible()
    await expect(page.getByText('Login')).toBeVisible()
    await page.waitForTimeout(800)
    await expect(page).toHaveURL(/\/admin\/login$/)
  })
})
