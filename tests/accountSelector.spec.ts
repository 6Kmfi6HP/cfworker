import { test, expect } from '@playwright/test';

test('AccountSelector functionality', async ({ page }) => {
  // 导航到应用首页
  await page.goto('http://localhost:5173/');

  // 验证初始状态
  const addButton = page.getByRole('button', { name: /Add First Account/i });
  await expect(addButton).toBeVisible();

  // 点击添加账户按钮
  await addButton.click();

  // 验证账户管理页面出现
  const accountForm = page.getByRole('heading', { name: /Account Management/i });
  await expect(accountForm).toBeVisible();
});