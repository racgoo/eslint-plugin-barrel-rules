// List of filenames allowed as barrel entry points
export const BARREL_ENTRY_POINT_FILE_NAMES = [
  "index.ts", // TypeScript entry
  "index.tsx", // React TypeScript entry
  "index.js", // JavaScript entry
  "index.jsx", // React JavaScript entry
  "index.cjs", // CommonJS entry
  "index.mjs", // ES Module entry
] as const;

// List of file extensions used for module resolution
export const RESOLVE_EXTENSIONS = [
  ".ts", // TypeScript
  ".js", // JavaScript
  ".tsx", // React TypeScript
  ".jsx", // React JavaScript
  ".json", // JSON file

  // Type declaration and transformed files
  ".d.js", // JS file with type declarations (rare)
  ".d.ts", // Type declaration file

  // Various module systems
  ".mjs", // ES Module
  ".cjs", // CommonJS

  // Module-related TypeScript extensions
  ".mts", // ES Module TypeScript
  ".cts", // CommonJS TypeScript

  // Type declarations for module-related files
  ".d.mjs", // Type declarations for ES Module
  ".d.cjs", // Type declarations for CommonJS
  ".d.mts", // Type declarations for ES Module TS
  ".d.cts", // Type declarations for CommonJS TS
] as const;
