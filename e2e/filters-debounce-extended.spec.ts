import { test, expect } from '@playwright/test'

test.describe('Debounce en todos los filtros', () => {
  test('category, sort, price, payment y location', async ({ page }) => {
    let reqCount = 0
    let mark = ''
    await page.route('**/api/posts*', (route) => {
      const url = route.request().url()
      const countIf =
        (mark === 'category' && url.includes('category=servicios')) ||
        (mark === 'sort' && url.includes('sort=rating_desc')) ||
        (mark === 'price' && (url.includes('minPrice=100') || url.includes('maxPrice=500'))) ||
        (mark === 'location') ||
        (mark === 'payment' && url.includes('payment=cash'))
      if (countIf) reqCount++
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

    // Category chip
    mark = 'category'
    const baseCat = reqCount
    await page.getByText('Servicios', { exact: true }).click()
    await page.waitForTimeout(200)
    expect(reqCount - baseCat).toBe(0)
    await page.waitForTimeout(1200)
    expect(reqCount - baseCat).toBeGreaterThan(0)

    // Sort change inside dialog
    mark = 'sort'
    const baseSort = reqCount
    await page.getByRole('button', { name: 'Filtros y Ordenamiento' }).click()
    await page.getByText('Ordenar por', { exact: true }).waitFor({ state: 'visible' })
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Mejor valorados' }).click()
    await page.waitForTimeout(200)
    expect(reqCount - baseSort).toBe(0)
    await page.waitForTimeout(1200)
    expect(reqCount - baseSort).toBeGreaterThan(0)

    // Min/Max price inputs
    mark = 'price'
    const basePrice = reqCount
    const minInput = page.locator('input[type="number"]').first()
    const maxInput = page.locator('input[type="number"]').nth(1)
    await minInput.fill('100')
    await maxInput.fill('500')
    await page.waitForTimeout(200)
    expect(reqCount - basePrice).toBe(0)
    await page.waitForTimeout(1200)
    expect(reqCount - basePrice).toBeGreaterThan(0)

    // Location
    mark = 'location'
    const baseLoc = reqCount
    await page.getByPlaceholder('Ciudad, barrio…').fill('Mar del Plata')
    await page.waitForTimeout(200)
    expect(reqCount - baseLoc).toBe(0)
    await page.waitForTimeout(1200)
    expect(reqCount - baseLoc).toBeGreaterThan(0)

    // Payment chip
    mark = 'payment'
    const basePay = reqCount
    await page.getByText('Métodos de pago', { exact: true }).waitFor({ state: 'visible' })
    await page.getByText('Efectivo', { exact: true }).click()
    await page.waitForTimeout(200)
    expect(reqCount - basePay).toBe(0)
    await page.waitForTimeout(1200)
    expect(reqCount - basePay).toBeGreaterThan(0)
  })
})
