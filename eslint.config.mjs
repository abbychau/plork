import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "src/app/api/**/*",
      "src/app/login/**/*",
      "src/app/posts/**/*",
      "src/app/register/**/*",
      "src/app/users/**/*",
      "src/components/markdown-content.tsx",
      "src/components/notification-dropdown.tsx",
      "src/components/post-editor.tsx",
      "src/components/timeline.tsx",
      "src/lib/activitypub.ts"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/alt-text": "off",
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;
