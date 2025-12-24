import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const isPackageBuild = process.env.BUILD_MODE === 'package';

// Plugin to remove .ts extensions from imports
const removeTsExtensions = () => {
  return {
    name: 'remove-ts-extensions',
    transform(code: string, id: string) {
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        // Replace imports with .ts extensions
        return code.replace(
          /from\s+['"](\.\/[^'"]+)\.ts['"]/g,
          'from "$1"'
        );
      }
      return code;
    }
  };
};

export default defineConfig({
  base: './',
  build: isPackageBuild ? {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'maplat_transform',
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'maplat_transform.js';
          case 'umd':
            return 'maplat_transform.umd.js';
          default:
            return 'maplat_transform.js';
        }
      }
    }
  } : {
    outDir: 'dist-demo',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  plugins: [
    removeTsExtensions(),
    dts({
      outDir: isPackageBuild ? 'dist' : 'dist-demo',
      exclude: ['tests', 'public'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
      logLevel: 'silent'
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
  }
});