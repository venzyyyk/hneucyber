"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Path = string;

const toKeys = (path: Path) => path.split(".").map((k) => (/^\d+$/.test(k) ? Number(k) : k));

export function getIn(obj: unknown, path: Path): unknown {
  return toKeys(path).reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]), obj);
}

export function setIn<T>(obj: T, path: Path, value: unknown): T {
  const keys = toKeys(path);
  const walk = (node: unknown, i: number): unknown => {
    const key = keys[i];
    const base = Array.isArray(node) ? [...node] : { ...(node as object) };
    (base as Record<string | number, unknown>)[key] =
      i === keys.length - 1 ? value : walk((node as Record<string | number, unknown>)?.[key], i + 1);
    return base;
  };
  return walk(obj, 0) as T;
}

/**
 * Мінімальний стан форми для адмінки: значення, dirty, помилки за шляхом "a.b.0.c".
 * Валідація — zod-схемою на сервері, помилки повертаються сюди ж.
 */
export function useDraft<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = useMemo(() => JSON.stringify(value) !== baseline, [value, baseline]);

  const get = useCallback(<V = unknown>(path: Path) => getIn(value, path) as V, [value]);

  const set = useCallback((path: Path, next: unknown) => {
    setValue((prev) => setIn(prev, path, next));
    setErrors((prev) => {
      if (!Object.keys(prev).some((k) => k === path || k.startsWith(`${path}.`))) return prev;
      const copy = { ...prev };
      for (const k of Object.keys(copy)) if (k === path || k.startsWith(`${path}.`)) delete copy[k];
      return copy;
    });
  }, []);

  const update = useCallback((fn: (prev: T) => T) => setValue(fn), []);

  const markSaved = useCallback((saved?: T) => {
    const next = saved ?? value;
    setBaseline(JSON.stringify(next));
    if (saved) setValue(saved);
  }, [value]);

  // Попередження при закритті вкладки з незбереженими змінами
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return { value, get, set, update, dirty, errors, setErrors, markSaved, reset: () => setValue(JSON.parse(baseline) as T) };
}

export type Draft<T> = ReturnType<typeof useDraft<T>>;
