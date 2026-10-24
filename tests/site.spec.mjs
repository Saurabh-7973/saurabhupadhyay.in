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

test('each viewport downloads only its own demo poster', async ({ browser }) => {
  for (const [width, want, not] of [
    [390, 'guidester-demo-phone-poster', 'guidester-demo-poster'],
    [1280, 'guidester-demo-poster', 'guidester-demo-phone-poster'],
  ]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    const posters = [];
    page.on('request', (r) => /poster\.webp$/.test(r.url()) && posters.push(r.url()));
    await page.goto('/');
    await page.waitForTimeout(1500);
    expect(posters.some((u) => u.endsWith(`/${want}.webp`)), `${width}px: ${posters}`).toBe(true);
    expect(posters.some((u) => u.endsWith(`/${not}.webp`)), `${width}px: ${posters}`).toBe(false);
    await context.close();
  }
});

test('the desktop shows its poster before the first video frame', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 844 } });
  const page = await context.newPage();
  await page.route(/\.(webm|mp4)$/, (route) => route.abort());
  const poster = page.waitForResponse(/guidester-demo-poster\.webp$/);
  await page.goto('/');
  expect((await poster).status()).toBe(200);
  const video = page.locator('.demo-video');
  expect(await video.evaluate((v) => v.readyState)).toBe(0);
  expect(await video.evaluate((v) => getComputedStyle(v).backgroundImage)).toContain('guidester-demo-poster.webp');
  // An all-black 1000x600 box compresses to a few hundred bytes; the poster doesn't.
  expect((await video.screenshot()).length).toBeGreaterThan(20000);
  await context.close();
});
