import { request, type FullConfig } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const accounts = {
  admin: ["demo.admin@sicsemper.local", "DemoEvento2026!"],
  judge: ["demo.juez1@sicsemper.local", "DemoEvento2026!"],
  participant: ["demo.participante11@sicsemper.local", "DemoEvento2026!"],
} as const;

export default async function globalSetup(config: FullConfig) {
  const baseURL = String(config.projects[0].use.baseURL || "http://localhost:3000");
  await mkdir(resolve(config.rootDir, "playwright/.auth"), { recursive: true });
  for (const [role, [email, password]] of Object.entries(accounts)) {
    const context = await request.newContext({ baseURL });
    try {
      const response = await context.post("/api/v1/auth/login", {
        data: { email, password, rememberMe: true },
      });
      if (!response.ok()) {
        throw new Error(`No se pudo autenticar ${role}: HTTP ${response.status()}`);
      }
      await context.storageState({
        path: resolve(config.rootDir, `playwright/.auth/${role}.json`),
      });
    } finally {
      await context.dispose();
    }
  }
}
