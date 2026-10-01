import { RulesEditor } from "@/components/admin/RulesEditor";
import { LoadError, StoreMissing } from "@/components/admin/StoreMissing";
import { loadContent, type ContentData } from "@/lib/admin/content";
import { getStore } from "@/lib/admin/store";

const TITLE = "Правила";

export default async function AdminRulesPage() {
  const store = getStore();
  if (!store) return <StoreMissing title={TITLE} />;

  let loaded: { data: ContentData<"rules">; sha: string | null } | null = null;
  let error = "";
  try {
    loaded = await loadContent(store, "rules");
  } catch (err) {
    error = err instanceof Error ? err.message : "Помилка завантаження";
  }

  if (!loaded) return <LoadError title={TITLE} error={error} />;
  return <RulesEditor initial={loaded.data} sha={loaded.sha} />;
}
