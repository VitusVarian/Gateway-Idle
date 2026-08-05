import { expect, test } from '@playwright/test'

test('loads the game scaffold page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Idle Prototype Scaffold' })).toBeVisible()
  await expect(page.getByText('Monster Souls:')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Battle', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Training', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Achievements', exact: true })).toBeVisible()
})

test('supports keyboard flow and stage progression interactions', async ({ page }) => {
  await page.goto('/')

  const advanceStageButton = page.getByRole('button', { name: 'Advance to next stage' })
  await advanceStageButton.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Stage 2 / unlocked to 2')).toBeVisible()

  for (let i = 0; i < 8; i += 1) {
    await advanceStageButton.click()
  }

  await expect(page.getByRole('button', { name: 'Start Training Reset' })).toBeEnabled()
})
