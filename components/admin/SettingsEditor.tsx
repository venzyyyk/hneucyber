"use client";

import { useState, useTransition } from "react";
import type { SiteContent } from "@/lib/content/schema";
import { REGISTRATION_STATUSES, registrationStatusLabels } from "@/lib/content/schema";
import type { ActionResult, PendingUpload } from "@/lib/admin/types";
import { saveSiteAction } from "@/app/admin/actions";
import { useDraft } from "./useDraft";
import { SaveBar } from "./SaveBar";
import { ImageField } from "./ImageField";
import {
  AddButton,
  Card,
  NumberInput,
  PageTitle,
  RowTools,
  SelectInput,
  StringList,
  TextArea,
  TextInput,
  Toggle,
  move,
} from "./ui";

export function SettingsEditor({ initial, sha: initialSha }: { initial: SiteContent; sha: string | null }) {
  const draft = useDraft<SiteContent>(initial);
  const { value: v, set, errors } = draft;
  const [sha, setSha] = useState(initialSha);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const text = (path: string, label: string, extra: { hint?: string; placeholder?: string; className?: string } = {}) => (
    <TextInput label={label} value={draft.get<string>(path)} onChange={(x) => set(path, x)} error={errors[path]} {...extra} />
  );
  const area = (path: string, label: string, rows = 3) => (
    <TextArea label={label} value={draft.get<string>(path)} onChange={(x) => set(path, x)} error={errors[path]} rows={rows} />
  );
  const image = (path: string, label: string, target: "logo" | "hero", hint?: string) => (
    <ImageField
      label={label}
      value={draft.get<string>(path)}
      onChange={(x) => set(path, x)}
      target={target}
      previews={previews}
      onPreview={(p, url) => setPreviews((prev) => ({ ...prev, [p]: url }))}
      onUploaded={(u) => setUploads((prev) => [...prev, u])}
      error={errors[path]}
      hint={hint}
    />
  );

  const save = () =>
    startTransition(async () => {
      setResult(null);
      const res = await saveSiteAction({ data: v, sha, uploads });
      setResult(res);
      if (res.ok) {
        setSha(res.sha ?? sha);
        setUploads([]);
        draft.markSaved();
      } else if (res.fields) {
        draft.setErrors(res.fields);
        requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
    });

  const steps = v.about.steps;
  const stats = v.about.stats;
  const partners = v.partners;

  return (
    <>
      <PageTitle title="Турнір і тексти">
        Усе, що видно на головній і сторінці реєстрації. Після збереження сайт перезбирається автоматично.
      </PageTitle>

      <div className="space-y-6">
        <Card title="Турнір">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("tournament.discipline", "Дисципліна")}
            {text("tournament.disciplineShort", "Дисципліна коротко", { hint: "Для бейджів: CS2, Dota 2…" })}
            {text("tournament.format", "Формат", { placeholder: "5×5" })}
            {text("tournament.dateLabel", "Дата", { placeholder: "12–14 грудня або «Дата уточнюється»" })}
            <NumberInput
              label="Гравців у команді"
              value={v.tournament.teamSize}
              onChange={(x) => set("tournament.teamSize", x)}
              min={1}
              max={10}
              error={errors["tournament.teamSize"]}
              hint="Форма реєстрації підлаштується"
            />
            <SelectInput
              label="Запасний гравець"
              value={String(v.tournament.substitutes)}
              onChange={(x) => set("tournament.substitutes", Number(x))}
              options={[
                { value: "1", label: "Дозволений (1)" },
                { value: "0", label: "Без запасних" },
              ]}
            />
            {text("tournament.stages", "Етапи", { className: "sm:col-span-2" })}
          </div>
        </Card>

        <Card title="Реєстрація" hint="«Скоро» і «Закрита» ховають форму і вимикають прийом заявок.">
          <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
            <SelectInput
              label="Статус"
              value={v.registration.status}
              onChange={(x) => set("registration.status", x)}
              options={REGISTRATION_STATUSES.map((s) => ({ value: s, label: registrationStatusLabels[s] }))}
            />
            {area("registration.note", "Оголошення над формою (порожньо — не показувати)", 2)}
          </div>
        </Card>

        <Card title="Головний екран">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("title.0", "Заголовок, рядок 1")}
            {text("title.1", "Заголовок, рядок 2")}
            {text("tagline", "Підзаголовок", { className: "sm:col-span-2" })}
            <div className="sm:col-span-2">{area("description", "Опис")}</div>
            <div className="sm:col-span-2">
              {image("heroImage", "Заглавна картинка", "hero", "Необов'язково. Без картинки показується згенерований арт.")}
            </div>
          </div>
        </Card>

        <Card title="Про систему турнірів">
          <div className="space-y-4">
            {area("about.lead", "Лід (виділений абзац)")}
            {area("about.body", "Текст", 4)}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mute">Етапи</p>
              <ul className="space-y-3">
                {steps.map((_, i) => (
                  <li key={i} className="rounded-xl border border-line bg-ink/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-lilac-300">ЕТАП {String(i + 1).padStart(2, "0")}</span>
                      <RowTools
                        index={i}
                        count={steps.length}
                        label={`Етап ${i + 1}`}
                        onMove={(a, b) => set("about.steps", move(steps, a, b))}
                        onRemove={() => set("about.steps", steps.filter((__, j) => j !== i))}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
                      {text(`about.steps.${i}.title`, "Назва")}
                      {text(`about.steps.${i}.text`, "Опис")}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <AddButton onClick={() => set("about.steps", [...steps, { title: "", text: "" }])} disabled={steps.length >= 8}>
                  Додати етап
                </AddButton>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mute">Цифри під етапами</p>
              <ul className="space-y-2">
                {stats.map((_, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-[120px_1fr]">
                      {text(`about.stats.${i}.value`, "Значення")}
                      {text(`about.stats.${i}.label`, "Підпис")}
                    </div>
                    <div className="pt-6">
                      <RowTools
                        index={i}
                        count={stats.length}
                        label={`Цифра ${i + 1}`}
                        onMove={(a, b) => set("about.stats", move(stats, a, b))}
                        onRemove={() => set("about.stats", stats.filter((__, j) => j !== i))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <AddButton onClick={() => set("about.stats", [...stats, { value: "", label: "" }])} disabled={stats.length >= 4}>
                  Додати цифру
                </AddButton>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Локація офлайн-частини">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("location.venue", "Назва місця")}
            {text("location.kind", "Тип", { placeholder: "Кіберклуб · офлайн-частина турніру" })}
            {text("location.address", "Адреса")}
            {text("location.hint", "Як дістатися")}
            {text("location.mapsQuery", "Запит для карти", { hint: "Що шукати на Google Maps" })}
            {text("location.mapsLink", "Посилання «Прокласти маршрут»", { placeholder: "https://maps.app.goo.gl/…" })}
            <div className="sm:col-span-2">
              <StringList
                label="Фішки місця"
                values={v.location.features}
                onChange={(x) => set("location.features", x)}
                errors={errors}
                errorPrefix="location.features"
                addLabel="Додати фішку"
                max={8}
              />
            </div>
          </div>
        </Card>

        <Card title="Партнери" hint="Логотип краще в SVG або PNG з прозорим фоном.">
          <ul className="space-y-3">
            {partners.map((p, i) => (
              <li key={i} className="rounded-xl border border-line bg-ink/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Toggle checked={p.highlight} onChange={(x) => set(`partners.${i}.highlight`, x)} label="Виділити (спонсор)" />
                  <RowTools
                    index={i}
                    count={partners.length}
                    label={`Партнер ${i + 1}`}
                    onMove={(a, b) => set("partners", move(partners, a, b))}
                    onRemove={() => set("partners", partners.filter((__, j) => j !== i))}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {text(`partners.${i}.name`, "Назва")}
                  {text(`partners.${i}.role`, "Роль", { placeholder: "Спонсор" })}
                  {text(`partners.${i}.href`, "Сайт", { placeholder: "https://…" })}
                </div>
                <div className="mt-3">{image(`partners.${i}.logo`, "Логотип", "logo")}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <AddButton
              onClick={() => set("partners", [...partners, { name: "", role: "", logo: "", href: "", highlight: false }])}
              disabled={partners.length >= 8}
            >
              Додати партнера
            </AddButton>
          </div>
        </Card>

        <Card title="Контакти">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("contacts.telegram", "Telegram-канал", { placeholder: "https://t.me/…" })}
            {text("contacts.telegramLabel", "Підпис кнопки")}
            {text("contacts.instagram", "Instagram", { placeholder: "https://instagram.com/…" })}
          </div>
        </Card>

        <Card title="Сайт">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("name", "Назва сайту", { hint: "Вкладка браузера, футер" })}
            {text("url", "Домен", { placeholder: "https://…", hint: "Для SEO і превʼю в соцмережах" })}
          </div>
        </Card>
      </div>

      <SaveBar
        dirty={draft.dirty}
        pending={pending}
        result={result}
        onSave={save}
        onReset={() => {
          draft.reset();
          draft.setErrors({});
          setUploads([]);
          setResult(null);
        }}
      />
    </>
  );
}
