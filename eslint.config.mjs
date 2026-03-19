import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/application/admin/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/presentation/**"],
        },
      ],
    },
  },
  {
    files: ["src/application/participant/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/presentation/**"],
        },
      ],
    },
  },
  {
    files: ["src/application/judge/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/presentation/**"],
        },
      ],
    },
  },
  {
    files: ["src/presentation/components/features/admin/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/infrastructure/api/**", "@/application/admin/admin.service"],
        },
      ],
    },
  },
  {
    files: ["src/presentation/components/features/participant/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/infrastructure/api/**", "@/application/participant/participant.service"],
        },
      ],
    },
  },
  {
    files: ["src/presentation/components/features/judge/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/infrastructure/api/**", "@/application/judge/judge.service"],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  eslintConfigPrettier,
]);

export default eslintConfig;
