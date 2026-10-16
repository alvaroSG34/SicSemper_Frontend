import { expect, test } from "@playwright/test";
import { collectResponsiveIssues } from "./responsive-audit";

const eventId = "5e3f8f40-2e3e-4f47-8f6c-000000000001";
const viewports = [
  [320, 568],
  [360, 800],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [639, 800],
  [640, 800],
  [767, 900],
  [768, 900],
  [1023, 800],
  [1024, 800],
  [1279, 800],
  [1280, 800],
] as const;

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/recuperar-contrasena",
  "/terminos",
  "/privacidad",
];
const roleRoutes = {
  admin: ["/admin", `/admin/eventos/${eventId}/control`],
  judge: [
    "/juez",
    "/juez/eventos",
    `/juez/eventos/pasados/${eventId}`,
    `/juez/eventos/pasados/${eventId}/podio`,
  ],
  participant: [
    "/participante",
    "/participante/eventos",
    `/participante/eventos/${eventId}/podio`,
    `/participante/subir`,
  ],
} as const;

async function auditRoute(
  page: Parameters<typeof collectResponsiveIssues>[0],
  route: string,
  width: number,
  height: number,
) {
  await page.setViewportSize({ width, height });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const issues = await collectResponsiveIssues(page);
  if (issues.length > 0) {
    await page.screenshot({
      path: `test-results/overlap-${route.replace(/[^a-z0-9]+/gi, "-")}-${width}x${height}.png`,
      fullPage: true,
    });
  }
  expect(issues, `${route} at ${width}x${height}: ${JSON.stringify(issues)}`).toEqual([]);
}

test.describe("responsive audit: public routes", () => {
  for (const route of publicRoutes) {
    test(`${route} has no responsive overlap`, async ({ page }) => {
      for (const [width, height] of viewports) await auditRoute(page, route, width, height);
    });
  }
});

for (const [role, routes] of Object.entries(roleRoutes)) {
  test.describe(`responsive audit: ${role}`, () => {
    test.use({ storageState: `tests/e2e/playwright/.auth/${role}.json` });
    for (const route of routes) {
      test(`${route} has no responsive overlap`, async ({ page }) => {
        for (const [width, height] of viewports) await auditRoute(page, route, width, height);
      });
    }
  });
}
