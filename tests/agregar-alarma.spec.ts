import { test, expect } from '@playwright/test';

test('Al agregar una alarma debe aparecer en la lista', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('div').filter({ hasText: 'Alarmas Programadas2' }).nth(2).click();
  await page.getByRole('button', { name: 'Agregar nueva alarma' }).click();
  await page.getByRole('textbox', { name: 'Hora' }).click();
  await page.getByRole('textbox', { name: 'Hora' }).fill('09:00');
  await page.getByRole('textbox', { name: 'Medicamento' }).click();
  await page.getByRole('textbox', { name: 'Medicamento' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Medicamento' }).fill('P');
  await page.getByRole('textbox', { name: 'Medicamento' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Medicamento' }).fill('Paracetamol');
  await page.getByRole('textbox', { name: 'Dosis' }).click();
  await page.getByRole('textbox', { name: 'Dosis' }).fill('400mg');
  await page.getByRole('button', { name: 'Guardar Alarma' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: ':00Paracetamol400mg' })).toBeVisible();
});