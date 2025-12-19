import { test, expect } from '@playwright/test'

// Mock de auth para simular usuario logueado
const mockAuthRoute = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/auth/status', (route) => {
    route.fulfill({ status: 200, json: { ok: true, role: 'user', userId: 'usr-test' } })
  })
}

test.describe('Wizard de creación de publicaciones', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthRoute(page)
  })

  test('Muestra todas las categorías sin "próximamente"', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    // Esperar a que cargue el wizard
    await expect(page.getByRole('heading', { name: 'Crear publicación' })).toBeVisible()
    
    // Verificar que todas las categorías están disponibles y clickeables
    const categories = ['Evento', 'Servicio', 'Producto', 'Usado', 'Curso', 'Pedido']
    
    for (const category of categories) {
      const button = page.getByRole('button', { name: new RegExp(`Elegir ${category}`, 'i') })
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
    }
    
    // Verificar que no aparece "próximamente"
    await expect(page.getByText('próximamente')).not.toBeVisible()
  })

  test('Selección de categoría no modifica el layout', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    // Obtener posición inicial del primer botón de categoría
    const eventButton = page.getByRole('button', { name: /Elegir Evento/i })
    const initialBox = await eventButton.boundingBox()
    expect(initialBox).not.toBeNull()
    
    // Seleccionar otra categoría
    await page.getByRole('button', { name: /Elegir Servicio/i }).click()
    
    // Verificar que la posición del botón evento no cambió
    const afterBox = await eventButton.boundingBox()
    expect(afterBox).not.toBeNull()
    expect(afterBox!.y).toBeCloseTo(initialBox!.y, 5)
    expect(afterBox!.height).toBeCloseTo(initialBox!.height, 5)
  })

  test('Cada campo tiene tooltip de ayuda', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    // Seleccionar una categoría
    await page.getByRole('button', { name: /Elegir Evento/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Verificar que existen los botones de ayuda (HelpCircle)
    const helpButtons = page.getByRole('button', { name: 'Ayuda' })
    const count = await helpButtons.count()
    expect(count).toBeGreaterThan(3) // Al menos varios campos tienen ayuda
  })

  test('Generador de imagen funciona con título', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    // Seleccionar categoría
    await page.getByRole('button', { name: /Elegir Evento/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Sin título, el botón de generar debe estar deshabilitado o mostrar mensaje
    const generateButton = page.getByRole('button', { name: /Escribí un título primero|Generar imagen/i })
    await expect(generateButton).toBeVisible()
    
    // Escribir título
    await page.getByLabel(/Título/i).fill('Mi evento de prueba')
    
    // Ahora el botón debe permitir generar
    await expect(page.getByRole('button', { name: /Generar imagen con IA/i })).toBeVisible()
  })

  test('Flujo completo de creación de evento', async ({ page }) => {
    // Mock del POST
    await page.route('**/api/posts', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          json: { data: { id: 'test-post-id' } }
        })
      } else {
        route.continue()
      }
    })
    
    await page.goto('/publicaciones/crear')
    
    // Paso 0: Categoría
    await page.getByRole('button', { name: /Elegir Evento/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 1: Datos
    await page.getByLabel(/Título/i).fill('Taller de arte inclusivo')
    await page.getByRole('button', { name: /Generar imagen con IA/i }).click()
    // Esperar que se genere la imagen
    await expect(page.locator('img[alt="Preview"]')).toBeVisible({ timeout: 5000 })
    
    await page.getByLabel(/Descripción/i).fill('Un taller abierto para toda la comunidad donde aprenderemos técnicas de arte colaborativo.')
    await page.getByLabel(/Lugar/i).fill('Centro Cultural Comunitario')
    
    // Fecha de inicio - usar el date picker
    await page.getByRole('button', { name: /Seleccionar fecha/i }).first().click()
    // Seleccionar el día 25 del mes actual o siguiente
    await page.locator('button[name="day"]').filter({ hasText: '25' }).first().click()
    
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 2: Precio y pagos
    await page.getByLabel(/Precio/i).fill('Gratis')
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 3: Contacto
    // Seleccionar tipo de contacto
    const selectTrigger = page.locator('[data-slot="select-trigger"]').first()
    await selectTrigger.click()
    await page.getByRole('option', { name: 'Instagram' }).click()
    await page.getByPlaceholder('@usuario / número / enlace').first().fill('@mi_evento')
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 4: Moderación
    await page.getByLabel(/Nombre completo/i).fill('Juan Pérez')
    await page.getByLabel(/Teléfono/i).fill('+54 9 11 1234-5678')
    await page.getByLabel(/Email/i).fill('juan@test.com')
    
    // Aceptar términos
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    await termsCheckbox.click()
    
    // Enviar
    const submitButton = page.getByRole('button', { name: 'Enviar publicación' })
    await expect(submitButton).toBeEnabled()
  })

  test('Campos específicos por categoría - Servicios', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    await page.getByRole('button', { name: /Elegir Servicio/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Verificar campos específicos de servicios
    await expect(page.getByLabel(/Años de experiencia/i)).toBeVisible()
    await expect(page.getByLabel(/Disponibilidad/i)).toBeVisible()
    await expect(page.getByLabel(/Zona de servicio/i)).toBeVisible()
  })

  test('Campos específicos por categoría - Productos', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    await page.getByRole('button', { name: /Elegir Producto/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Verificar campos específicos de productos
    await expect(page.getByText(/Condición/i)).toBeVisible()
    await expect(page.getByLabel(/Stock/i)).toBeVisible()
    await expect(page.getByLabel(/Garantía/i)).toBeVisible()
  })

  test('Campos específicos por categoría - Usados', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    await page.getByRole('button', { name: /Elegir Usado/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Verificar campos específicos de usados
    await expect(page.getByLabel(/Tiempo de uso/i)).toBeVisible()
  })

  test('Campos específicos por categoría - Cursos', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    await page.getByRole('button', { name: /Elegir Curso/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Verificar campos específicos de cursos
    await expect(page.getByText(/Modalidad/i)).toBeVisible()
    await expect(page.getByLabel(/Duración/i)).toBeVisible()
    await expect(page.getByLabel(/Horario/i)).toBeVisible()
  })

  test('Campos específicos por categoría - Pedidos', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    await page.getByRole('button', { name: /Elegir Pedido/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Verificar campos específicos de pedidos
    await expect(page.getByLabel(/Fecha límite/i)).toBeVisible()
    await expect(page.getByLabel(/Presupuesto/i)).toBeVisible()
  })

  test('Validación de email en datos de moderación', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    // Navegar al paso de moderación
    await page.getByRole('button', { name: /Elegir Servicio/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Llenar datos mínimos del paso 1
    await page.getByLabel(/Título/i).fill('Mi servicio')
    await page.getByRole('button', { name: /Generar imagen con IA/i }).click()
    await expect(page.locator('img[alt="Preview"]')).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/Descripción/i).fill('Descripción de mi servicio de prueba')
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 2
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 3: Contacto
    const selectTrigger = page.locator('[data-slot="select-trigger"]').first()
    await selectTrigger.click()
    await page.getByRole('option', { name: 'Whatsapp' }).click()
    await page.getByPlaceholder('@usuario / número / enlace').first().fill('+5491112345678')
    await page.getByRole('button', { name: 'Continuar' }).click()
    
    // Paso 4: Probar validación de email
    const emailInput = page.getByLabel(/Email/i)
    await emailInput.fill('email-invalido')
    await emailInput.blur()
    
    // Debería mostrar error de validación
    await expect(page.getByText(/email válido/i)).toBeVisible({ timeout: 3000 })
    
    // Corregir el email
    await emailInput.clear()
    await emailInput.fill('correcto@email.com')
    await emailInput.blur()
    
    // El error debería desaparecer
    await expect(page.getByText(/email válido/i)).not.toBeVisible()
  })

  test('Navegación entre pasos funciona correctamente', async ({ page }) => {
    await page.goto('/publicaciones/crear')
    
    // Verificar que estamos en paso 1
    await expect(page.getByText('1. Categoría')).toBeVisible()
    
    // Ir al paso 2
    await page.getByRole('button', { name: /Elegir Evento/i }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByText('2. Datos')).toBeVisible()
    
    // Volver al paso 1
    await page.getByRole('button', { name: 'Volver' }).click()
    await expect(page.getByText('1. Categoría')).toBeVisible()
    
    // La categoría debe seguir seleccionada
    const eventButton = page.getByRole('button', { name: /Elegir Evento/i })
    await expect(eventButton).toHaveClass(/bg-gradient/)
  })
})
