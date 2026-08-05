import { expect, test } from '@playwright/test'

test('loads the game scaffold page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Idle Prototype Scaffold' })).toBeVisible()
})
