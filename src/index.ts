import path from 'node:path';

import { globbySync } from 'globby';
import { PluginOption, UserConfig } from 'vite';

const PUBLIC_PATH = '/';

export default function mpaPlugin(): Awaited<PluginOption> {
  const entryList = createEntryList();
  const entryById = Object.fromEntries(
    entryList.map((entry) => [entry.id, entry])
  );
  const entryByPathname = Object.fromEntries(
    entryList.map((entry) => [entry.pathname, entry])
  );
  const input = Object.fromEntries(
    entryList.map((entry) => [entry.key, entry.id])
  );

  return {
    name: 'vite-html-plugin',
    enforce: 'pre',
    config: (): UserConfig => {
      return {
        build: {
          rollupOptions: {
            input,
          },
        },
      };
    },
    resolveId(source): string | void {
      return entryById[source]?.id;
    },
    load(id): string | void {
      return entryById[id]?.html;
    },
    configureServer(server): void {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '', `http://${req.headers.host ?? ''}`);
        const entry = entryByPathname[url.pathname];
        if (entry != null) {
          server
            .transformIndexHtml(req.url ?? '', entry.html)
            .then((v) => {
              res.end(v);
            })
            .catch(next);
          return;
        }

        next();
      });
    },
  };
}

type Entry = {
  html: string;
  id: string;
  pathname: string;
  key: string;
};

const HTML = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="{{ SCRIPT }}"></script>
  </body>
</html>
`;

function createEntryList(): Entry[] {
  const files = globbySync('src/pages/**/*.{ts,tsx}');
  return files.map((file) => {
    const html = HTML.replace('{{ SCRIPT }}', path.resolve(file));
    const pathname = withoutExt(
      file.replace('src/pages/', '').replace(/\/index.tsx?$/, '')
    );

    const entry: Entry = {
      html,
      pathname: path.join(PUBLIC_PATH, pathname),
      id: path.join('.', `${pathname}/index.html`),
      key: pathname.replace(/\//g, '_'),
    };
    return entry;
  });
}

function withoutExt(s: string): string {
  const ss = s.split('.');
  if (ss.length > 1) {
    ss.pop();
  }
  return ss.join('.');
}
