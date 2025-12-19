import { test, expect } from '@playwright/test'

test.describe('Filtros con debounce 500ms', () => {
  test('search input no dispara request antes de 500ms', async ({ page }) => {
    let requestsAfterType = 0
    let mark = false
    await page.route('**/api/posts*', (route) => {
      const url = route.request().url()
      if (mark && url.includes('q=')) {
        requestsAfterType++
      }
      route.fulfill({
        status: 200,
        json: {
          data: [],
          pagination: { page: 1, pageSize: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
        },
      })
    })

    await page.goto('/publicaciones')
    await page.getByRole('heading', { name: 'Publicaciones' }).waitFor({ state: 'visible' })
    const input = page.locator('input[placeholder="Buscar por título, zona o etiquetas…"]')
    await expect(input).toBeVisible()

    mark = true
    const baseline = requestsAfterType
    await input.fill('terapia inclusiva')
    await page.waitForTimeout(200)
    expect(requestsAfterType - baseline).toBe(0)

    await page.waitForTimeout(900)
    expect(requestsAfterType - baseline).toBeGreaterThan(0)
  })
})
