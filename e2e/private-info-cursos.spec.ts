import { test, expect } from '@playwright/test'

test('Cursos form incluye textarea privateInfo', async ({ page }) => {
  await page.goto('/publicaciones/crear/cursos')
  await expect(page.getByRole('heading', { name: 'Publicar curso' })).toBeVisible()
  await expect(page.getByText('Información privada para moderación')).toBeVisible()
  const textarea = page.locator('textarea[name=\"privateInfo\"]')
  await expect(textarea).toBeVisible()
  await textarea.fill('Datos privados para validación')
  await expect(textarea).toHaveValue('Datos privados para validación')
})

