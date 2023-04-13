# vite-mpa-plugin

Vite plugin to generate a Multi-Page Application (MPA) with filesystem-based routing.

## Config

```ts
// vite.config.ts
import { defineConfig } from 'vite';

import mpa from '@yszk0123/vite-mpa-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [mpa()],
});
```

## Example

```
src/
  pages/
    example-a/
      index.ts
    example-b/
      index.ts
```

```ts
// src/pages/example-a/index.ts
console.log('example-a');
```

```ts
// src/pages/example-b/index.ts
console.log('example-b');
```

```bash
$ npx vite dev --port 3000
$ open http://localhost:3000/example-a
$ open http://localhost:3000/example-b
```
