const { test, expect } = require('playwright/test')

test('log reading supports new and existing book flows', async ({ page }) => {
  const bookTitle = `Playwright Smoke ${Date.now()}`

  await page.goto('http://127.0.0.1:5173/log-reading')
  await page.getByLabel('Minutes').fill('14')
  await page.getByLabel('Pages (optional)').fill('9')
  await page.getByLabel('Add new book').check()
  await page.getByLabel('Book', { exact: true }).fill(bookTitle)
  await page.getByLabel('Total pages in book (optional)').fill('222')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByRole('heading', { name: 'Reading logged!' })).toBeVisible()
  await expect(page.getByText('Failed to log reading session')).toHaveCount(0)
  await expect(page.getByText(bookTitle)).toBeVisible()

  await page.getByRole('button', { name: 'Log another session' }).click()
  await page.getByLabel('Minutes').fill('18')
  await page.getByLabel('Pages (optional)').fill('11')
  await page.getByLabel('Select existing').check()
  await page.getByLabel('Book').selectOption({ label: bookTitle })
  await page.getByLabel('I finished this book').check()
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByRole('heading', { name: 'Reading logged!' })).toBeVisible()
  await expect(page.getByText(bookTitle)).toBeVisible()
})
