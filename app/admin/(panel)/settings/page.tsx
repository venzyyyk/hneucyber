import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { LoadError, StoreMissing } from "@/components/admin/StoreMissing";
import { loadContent, type ContentData } from "@/lib/admin/content";
import { getStore } from "@/lib/admin/store";

const TITLE = "Турнір і тексти";

export default async function AdminSettingsPage() {
  const store = getStore();
  if (!store) return <StoreMissing title={TITLE} />;

  let loaded: { data: ContentData<"site">; sha: string | null } | null = null;
  let error = "";
  try {
    loaded = await loadContent(store, "site");
  } catch (err) {
    error = err instanceof Error ? err.message : "Помилка завантаження";
  }

  if (!loaded) return <LoadError title={TITLE} error={error} />;
  return <SettingsEditor initial={loaded.data} sha={loaded.sha} />;
}
