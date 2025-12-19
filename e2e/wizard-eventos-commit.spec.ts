import { test, expect } from '@playwright/test'

test('Wizard eventos exige aceptar compromisos antes de enviar', async ({ page }) => {
  await page.route('**/api/auth/status', (route) => {
    route.fulfill({ status: 200, json: { ok: true, role: 'user', userId: 'usr-1' } })
  })

  await page.goto('/publicaciones/crear/eventos')
  await expect(page.getByRole('heading', { name: 'Publicar evento' })).toBeVisible()

  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByLabel('Título', { exact: true }).fill('Encuentro comunitario')
  await page.getByLabel('Imagen (URL)').fill('https://example.com/image.jpg')
  await page.getByLabel('Descripción').fill('Actividad inclusiva para toda la comunidad.')
  await page.getByLabel('Autor', { exact: true }).fill('Autora Inclusiva')
  await page.getByLabel('Ubicación').fill('Mar del Plata')
  await page.getByLabel('Precio', { exact: true }).fill('0')
  await page.getByLabel('Fecha inicio').fill('2025-12-31')
  await page.getByLabel('Lugar').fill('Centro cultural')
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByText('Redes / Contactos').scrollIntoViewIfNeeded()
  const selectTrigger = page.locator('[data-slot="select-trigger"]').nth(2)
  await selectTrigger.click()
  await page.locator('[data-slot="select-content"]').waitFor()
  await page.locator('[data-slot="select-content"]').getByText('instagram', { exact: true }).click()
  await page.getByPlaceholder('@usuario / número / enlace').first().fill('@inclusiva')
  await page.getByRole('button', { name: 'Continuar' }).click()

  const submit = page.getByRole('button', { name: 'Enviar publicación' })
  await expect(submit).toBeDisabled()
  await page.getByRole('checkbox').nth(0).click()
  await page.getByRole('checkbox').nth(1).click()
  await expect(submit).toBeEnabled()
})
