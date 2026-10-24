import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages } from './pages.mjs';

for (const width of [360, 390, 1280]) {
  for (const path of pages) {
    test(`${path} at ${width}px: no sideways scroll, no axe violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      const { scroll, view } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        view: window.innerWidth,
      }));
      expect(scroll, 'page scrolls sideways').toBe(view);
      if (width !== 360) {
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
      }
    });
  }
}

test('each viewport downloads one demo video', async ({ page }) => {
  for (const [width, want] of [[390, 'guidester-demo-phone'], [1280, 'guidester-demo.']]) {
    const videos = [];
    page.on('request', (r) => /\.(webm|mp4)$/.test(r.url()) && videos.push(r.url()));
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    expect(videos.length, `${width}px: ${videos}`).toBe(1);
    expect(videos[0]).toContain(want);
    page.removeAllListeners('request');
  }
});
