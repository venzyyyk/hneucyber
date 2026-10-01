import "server-only";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Сховище контенту адмінки.
 *  - github: кожне збереження = коміт у репо через Git Data API → Vercel перезбирає сайт.
 *  - local:  у dev без GITHUB_TOKEN пише прямо у файли проєкту (next dev підхоплює одразу).
 */

export type RepoFile = { path: string; sha: string; size?: number };

export type Change =
  | { type: "text"; path: string; content: string }
  | { type: "blob"; path: string; sha: string }
  | { type: "delete"; path: string };

export type Store = {
  mode: "github" | "local";
  label: string;
  readText(filePath: string): Promise<{ content: string; sha: string } | null>;
  readBinary(filePath: string): Promise<Buffer | null>;
  listTree(prefix: string): Promise<RepoFile[]>;
  uploadBlob(filePath: string, bytes: Buffer): Promise<{ sha: string }>;
  commit(changes: Change[], message: string): Promise<{ url?: string }>;
};

export class StoreError extends Error {}

/* ---------- безпека шляхів ---------- */

const ALLOWED_PREFIXES = ["content/", "public/gallery/", "public/logos/", "public/hero/"];
const SAFE_PATH_RE = /^[A-Za-z0-9._\-/]+$/;

export function assertSafePath(p: string): string {
  const clean = p.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!SAFE_PATH_RE.test(clean) || clean.split("/").some((seg) => seg === ".." || seg === "." || seg === "")) {
    throw new StoreError(`Недопустимий шлях: ${p}`);
  }
  if (!ALLOWED_PREFIXES.some((prefix) => `${clean}/`.startsWith(prefix))) {
    throw new StoreError(`Шлях поза дозволеними папками: ${p}`);
  }
  return clean;
}

/** git hash-object: той самий sha, що повертає GitHub для файлу. */
export function gitBlobSha(content: string | Buffer): string {
  const buf = typeof content === "string" ? Buffer.from(content, "utf8") : content;
  return createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");
}

/* ---------- вибір режиму ---------- */

type GithubConfig = { token: string; owner: string; repo: string; branch: string };

function githubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const full =
    process.env.GITHUB_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");
  const [owner, repo] = full.split("/");
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main" };
}

export function getStore(): Store | null {
  const gh = githubConfig();
  if (gh) return githubStore(gh);
  // Без GitHub пишемо у файли лише в dev або за явним ADMIN_STORAGE=local.
  // На хостингу (Render / Vercel) файлова система тимчасова — правки злетять при редеплої
  // чи рестарті, тому там адмінка працює тільки через GitHub (коміти в репо).
  if (process.env.NODE_ENV !== "production" || process.env.ADMIN_STORAGE === "local") return localStore();
  return null;
}

/* ---------- локальні файли ---------- */

function localStore(): Store {
  const root = process.cwd();
  // turbopackIgnore: локальний режим лише для dev, не тягнемо весь проєкт у серверний бандл
  const abs = (p: string) => path.join(/*turbopackIgnore: true*/ root, assertSafePath(p));

  return {
    mode: "local",
    label: "локальні файли проєкту",

    async readText(p) {
      try {
        const content = await fs.readFile(abs(p), "utf8");
        return { content, sha: gitBlobSha(content) };
      } catch {
        return null;
      }
    },

    async readBinary(p) {
      try {
        return await fs.readFile(abs(p));
      } catch {
        return null;
      }
    },

    async listTree(prefix) {
      const base = abs(prefix);
      const out: RepoFile[] = [];
      async function walk(dir: string) {
        let entries: import("node:fs").Dirent[];
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) await walk(full);
          else if (e.isFile()) {
            const rel = path.relative(root, full).split(path.sep).join("/");
            const stat = await fs.stat(full);
            out.push({ path: rel, sha: `local-${stat.mtimeMs}`, size: stat.size });
          }
        }
      }
      await walk(base);
      return out.sort((a, b) => a.path.localeCompare(b.path));
    },

    async uploadBlob(p, bytes) {
      // Локально пишемо одразу — «коміт» лише фіксує JSON.
      const target = abs(p);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, bytes);
      return { sha: gitBlobSha(bytes) };
    },

    async commit(changes) {
      for (const c of changes) {
        const target = abs(c.path);
        if (c.type === "text") {
          await fs.mkdir(path.dirname(target), { recursive: true });
          await fs.writeFile(target, c.content, "utf8");
        } else if (c.type === "delete") {
          await fs.rm(target, { force: true });
        }
        // blob: файл уже записаний у uploadBlob
      }
      return {};
    },
  };
}

/* ---------- GitHub ---------- */

function githubStore(cfg: GithubConfig): Store {
  const base = (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, "");
  const api = `${base}/repos/${cfg.owner}/${cfg.repo}`;
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "khnue-cyber-admin",
  };

  async function gh<T>(url: string, init: RequestInit = {}, okStatuses: number[] = []): Promise<{ status: number; data: T }> {
    const res = await fetch(url.startsWith("http") ? url : `${api}${url}`, {
      ...init,
      headers: { ...headers, ...(init.headers ?? {}) },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok && !okStatuses.includes(res.status)) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new StoreError(`GitHub ${res.status}: ${body?.message ?? res.statusText}`);
    }
    const data = res.status === 204 ? (null as T) : ((await res.json().catch(() => null)) as T);
    return { status: res.status, data };
  }

  const ref = encodeURIComponent(cfg.branch);
  const encPath = (p: string) => assertSafePath(p).split("/").map(encodeURIComponent).join("/");

  return {
    mode: "github",
    label: `${cfg.owner}/${cfg.repo}@${cfg.branch}`,

    async readText(p) {
      const { status, data } = await gh<{ content?: string; encoding?: string; sha: string }>(
        `/contents/${encPath(p)}?ref=${ref}`,
        {},
        [404],
      );
      if (status === 404 || !data) return null;
      const content = Buffer.from(data.content ?? "", "base64").toString("utf8");
      return { content, sha: data.sha };
    },

    async readBinary(p) {
      const res = await fetch(`${api}/contents/${encPath(p)}?ref=${ref}`, {
        headers: { ...headers, Accept: "application/vnd.github.raw" },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new StoreError(`GitHub ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    },

    async listTree(prefix) {
      const clean = assertSafePath(prefix).replace(/\/?$/, "/");
      const { data } = await gh<{ tree: { path: string; type: string; sha: string; size?: number }[] }>(
        `/git/trees/${ref}?recursive=1`,
      );
      return (data?.tree ?? [])
        .filter((e) => e.type === "blob" && e.path.startsWith(clean))
        .map((e) => ({ path: e.path, sha: e.sha, size: e.size }))
        .sort((a, b) => a.path.localeCompare(b.path));
    },

    async uploadBlob(p, bytes) {
      assertSafePath(p);
      const { data } = await gh<{ sha: string }>("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: bytes.toString("base64"), encoding: "base64" }),
      });
      return { sha: data.sha };
    },

    async commit(changes, message) {
      if (changes.length === 0) return {};
      const tree = changes.map((c) => {
        const p = assertSafePath(c.path);
        if (c.type === "text") return { path: p, mode: "100644", type: "blob", content: c.content };
        if (c.type === "blob") return { path: p, mode: "100644", type: "blob", sha: c.sha };
        return { path: p, mode: "100644", type: "blob", sha: null };
      });

      // Якщо хтось запушив між читанням ref і оновленням — пробуємо ще раз від свіжого HEAD.
      for (let attempt = 0; attempt < 3; attempt++) {
        const head = await gh<{ object: { sha: string } }>(`/git/ref/heads/${ref}`);
        const parentSha = head.data.object.sha;
        const parent = await gh<{ tree: { sha: string } }>(`/git/commits/${parentSha}`);

        const newTree = await gh<{ sha: string }>("/git/trees", {
          method: "POST",
          body: JSON.stringify({ base_tree: parent.data.tree.sha, tree }),
        });
        const commit = await gh<{ sha: string; html_url: string }>("/git/commits", {
          method: "POST",
          body: JSON.stringify({ message, tree: newTree.data.sha, parents: [parentSha] }),
        });
        const update = await gh(
          `/git/refs/heads/${ref}`,
          { method: "PATCH", body: JSON.stringify({ sha: commit.data.sha, force: false }) },
          [422],
        );
        if (update.status !== 422) return { url: commit.data.html_url };
      }
      throw new StoreError("Не вдалося зберегти: гілку одночасно змінюють. Спробуй ще раз.");
    },
  };
}
