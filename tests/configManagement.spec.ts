import { test, expect } from '@playwright/test';

test.describe('ConfigManagement Component', () => {
  test('should export configuration successfully when an account exists', async ({ page }) => {
    // 导航到应用首页
    await page.goto('http://localhost:5173/');

    // 添加一个账户以启用导出按钮
    await page.getByRole('button', { name: /Add First Account/i }).click();

    // 等待账户管理对话框出现，并点击“添加账户”按钮
    await expect(page.getByRole('heading', { name: /Account Management/i })).toBeVisible();
    await page.getByRole('button', { name: /Add Account/i }).click();

    // 等待添加账户表单出现并填写
    await expect(page.getByRole('heading', { name: /Add Account/i, exact: true })).toBeVisible();
    await page.getByLabel(/Account Name/i).fill('Test Account');
    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByLabel(/Global API Key/i).fill('test-api-key');
    // 点击表单的提交按钮，而不是依赖于文本 "Add"
    await page.getByRole('dialog', { name: /Add Account/i }).getByRole('button', { name: /add/i, exact: true }).click();

    // 确认账户已添加，表单已关闭
    await expect(page.getByRole('heading', { name: 'Test Account' })).toBeVisible();
    // 点击关闭按钮来关闭账户管理对话框
    await page.getByRole('dialog', { name: /Account Management/i }).getByRole('button', { name: 'Close' }).click();

    // 打开配置管理
    await page.getByRole('button', { name: /Configuration Management/i }).click();

    // 验证对话框可见
    await expect(page.getByRole('heading', { name: /Configuration Management/i })).toBeVisible();

    // 等待下载事件
    const downloadPromise = page.waitForEvent('download');

    // 点击导出按钮
    await page.getByRole('button', { name: /Export Now/i }).click();

    // 等待下载完成
    const download = await downloadPromise;

    // 验证下载的文件名
    expect(download.suggestedFilename()).toMatch(/cfworker-config-.*\.json/);

    // 验证成功提示
    // Locate the toast by its role and the text it contains, ensuring it's visible.
    await expect(page.getByRole('status').filter({ hasText: 'Configuration exported successfully' })).toBeVisible();
  });
});