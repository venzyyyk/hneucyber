"use client";

import { useState, useTransition } from "react";
import type { RulesContent } from "@/lib/content/schema";
import type { ActionResult } from "@/lib/admin/types";
import { saveRulesAction } from "@/app/admin/actions";
import { useDraft } from "./useDraft";
import { SaveBar } from "./SaveBar";
import { AddButton, PageTitle, RowTools, StringList, TextInput, move } from "./ui";

export function RulesEditor({ initial, sha: initialSha }: { initial: RulesContent; sha: string | null }) {
  const draft = useDraft<RulesContent>(initial);
  const { value: sections, set, errors } = draft;
  const [sha, setSha] = useState(initialSha);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      setResult(null);
      const res = await saveRulesAction({ data: sections, sha });
      setResult(res);
      if (res.ok) {
        setSha(res.sha ?? sha);
        draft.markSaved();
      } else if (res.fields) {
        draft.setErrors(res.fields);
        requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
    });

  const setSections = (next: RulesContent) => draft.update(() => next);

  return (
    <>
      <PageTitle title="Правила">
        Розділи показуються на сторінці реєстрації як блоки, що розгортаються. Перший розділ відкритий за замовчуванням.
      </PageTitle>

      <ol className="space-y-4">
        {sections.map((section, i) => (
          <li key={i} className="rounded-2xl border border-line bg-ink-2/80 p-5 sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-8 font-mono text-xs text-lilac-300">{String(i + 1).padStart(2, "0")}</span>
              <TextInput
                className="flex-1"
                label="Назва розділу"
                value={section.title}
                onChange={(x) => set(`${i}.title`, x)}
                error={errors[`${i}.title`]}
              />
              <div className="mt-6">
                <RowTools
                  index={i}
                  count={sections.length}
                  label={`Розділ ${i + 1}`}
                  onMove={(a, b) => setSections(move(sections, a, b))}
                  onRemove={() => setSections(sections.filter((_, j) => j !== i))}
                />
              </div>
            </div>
            <StringList
              label="Пункти"
              values={section.items}
              onChange={(x) => set(`${i}.items`, x)}
              errors={errors}
              errorPrefix={`${i}.items`}
              addLabel="Додати пункт"
              multiline
            />
            {errors[`${i}.items`] && <p className="mt-2 text-xs text-danger">{errors[`${i}.items`]}</p>}
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <AddButton onClick={() => setSections([...sections, { title: "", items: [""] }])} disabled={sections.length >= 30}>
          Додати розділ
        </AddButton>
      </div>

      <SaveBar
        dirty={draft.dirty}
        pending={pending}
        result={result}
        onSave={save}
        onReset={() => {
          draft.reset();
          draft.setErrors({});
          setResult(null);
        }}
      />
    </>
  );
}
