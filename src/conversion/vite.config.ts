import path from 'path';
import {defineConfig} from 'vite';

export const config = defineConfig({
  resolve: {
    alias: {
      '#pkg': path.resolve(__dirname, 'src/ts/index.ts'),
    },
  },
});
