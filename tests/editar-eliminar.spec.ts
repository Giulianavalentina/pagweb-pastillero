import { test, expect } from '@playwright/test';

test('Al programar una alarma, debo poder editarla y a su vez eliminarla', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Nueva Alarma' }).click();
  await page.locator('input[type="time"]').fill('09:00');
  await page.getByRole('textbox', { name: 'Medicamento' }).fill('Paracetamol');
  await page.getByRole('textbox', { name: 'Dosis' }).fill('500mg');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('button', { name: /editar/i }).first().click();
  await page.getByRole('textbox', { name: 'Dosis' }).fill('200mg');
  await page.locator('input[type="time"]').fill('10:00');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('button', { name: /eliminar/i }).first().click();
  await page.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText('Paracetamol')).not.toBeVisible();
});