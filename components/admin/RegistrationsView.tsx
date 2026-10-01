"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Download, LoaderCircle, RefreshCw, Search, Trash2, User, Users } from "lucide-react";
import type { AdminRegistration } from "@/lib/server/sheets";
import { SHEET_HEADERS } from "@/lib/registration/sheet";
import { deleteRegistrationAction } from "@/app/admin/actions";
import { Btn, Notice, PageTitle } from "./ui";

type Filter = "all" | "team" | "solo";

const isTeam = (r: AdminRegistration) => r.type.toLowerCase().startsWith("команд");
const inKharkiv = (r: AdminRegistration) => r.inKharkiv.toLowerCase().startsWith("так");

export function RegistrationsView({ registrations, error }: { registrations: AdminRegistration[]; error: string | null }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const list = registrations.filter((r) => !removed.has(r.id));

  const stats = useMemo(() => {
    const teams = list.filter(isTeam).length;
    return [
      { label: "Заявок", value: list.length },
      { label: "Команд", value: teams },
      { label: "Соло", value: list.length - teams },
      { label: "Гравців", value: list.reduce((n, r) => n + r.players.length, 0) },
      { label: "У Харкові", value: list.filter(inKharkiv).length },
    ];
  }, [list]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((r) => {
      if (filter === "team" && !isTeam(r)) return false;
      if (filter === "solo" && isTeam(r)) return false;
      if (!q) return true;
      const hay = [r.id, r.team, ...r.players.flatMap((p) => [p.fullName, p.telegram, p.email, p.group, p.nickname])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [list, query, filter]);

  const exportCsv = () => {
    const rows = visible.flatMap((r) =>
      r.players.map((p) => [
        r.date, r.id, r.type, r.team, r.inKharkiv, p.role, p.fullName, p.group, p.course, p.institute, p.email, p.telegram, p.nickname,
      ]),
    );
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [SHEET_HEADERS as readonly string[], ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `zayavky-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle
        title="Заявки"
        actions={
          <>
            <Btn onClick={() => startRefresh(() => router.refresh())} disabled={refreshing}>
              {refreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Оновити
            </Btn>
            <Btn onClick={exportCsv} disabled={visible.length === 0}>
              <Download className="size-4" />
              CSV
            </Btn>
          </>
        }
      >
        Дані з Google Sheets. Видалення прибирає всі рядки заявки з таблиці.
      </PageTitle>

      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {flash && (
        <div className="mb-6">
          <Notice tone={flash.ok ? "ok" : "error"}>{flash.text}</Notice>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-ink-2 px-4 py-4 last:col-span-2 sm:last:col-span-1">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-2">{s.label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-lilac-300">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Пошук</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ПІБ, команда, Telegram, пошта, група, ID…"
            className="field !py-2 !pl-9 !text-sm"
          />
        </label>
        <div role="group" aria-label="Тип заявки" className="flex gap-1 rounded-xl border border-line bg-ink-2 p-1">
          {(
            [
              ["all", "Усі"],
              ["team", "Команди"],
              ["solo", "Соло"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                filter === value ? "bg-lilac-300 text-ink" : "text-lilac-100 hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {visible.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-mute">
            {list.length === 0 ? "Заявок поки немає." : "Нічого не знайдено."}
          </li>
        )}
        {visible.map((r) => (
          <RegistrationRow
            key={r.id}
            reg={r}
            open={open === r.id}
            onToggle={() => setOpen(open === r.id ? null : r.id)}
            onDeleted={(ok, text) => {
              setFlash({ ok, text });
              if (ok) setRemoved((prev) => new Set(prev).add(r.id));
            }}
          />
        ))}
      </ul>
    </>
  );
}

function RegistrationRow({
  reg,
  open,
  onToggle,
  onDeleted,
}: {
  reg: AdminRegistration;
  open: boolean;
  onToggle: () => void;
  onDeleted: (ok: boolean, text: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, startDelete] = useTransition();
  const team = isTeam(reg);
  const title = team ? reg.team || "Без назви" : reg.players[0]?.fullName || "—";

  const remove = () =>
    startDelete(async () => {
      const res = await deleteRegistrationAction(reg.id);
      setConfirm(false);
      onDeleted(res.ok, res.ok ? res.message : res.error);
    });

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-ink-2/80">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-lg ${team ? "bg-lilac-300 text-ink" : "border border-line text-lilac-200"}`}
          >
            {team ? <Users className="size-4" /> : <User className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-white">{title}</span>
            <span className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-mute">
              <span className="text-lilac-300">{reg.id}</span>
              <span>{reg.date}</span>
              <span>{team ? `${reg.players.length} гравців` : reg.players[0]?.telegram}</span>
              <span className={inKharkiv(reg) ? "text-ok" : ""}>{inKharkiv(reg) ? "Харків" : "не в Харкові"}</span>
            </span>
          </span>
          <ChevronDown className={`size-4 shrink-0 text-mute transition ${open ? "rotate-180" : ""}`} />
        </button>

        {confirm ? (
          <div className="flex shrink-0 items-center gap-1">
            <Btn variant="danger" onClick={remove} disabled={deleting} className="!px-3 !py-1.5">
              {deleting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Видалити
            </Btn>
            <Btn variant="ghost" onClick={() => setConfirm(false)} disabled={deleting}>
              Ні
            </Btn>
          </div>
        ) : (
          <Btn variant="icon" aria-label={`Видалити заявку ${reg.id}`} onClick={() => setConfirm(true)} className="hover:!text-danger">
            <Trash2 className="size-4" />
          </Btn>
        )}
      </div>

      {open && (
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-[0.15em] text-mute-2">
              <tr>
                {["Роль", "ПІБ", "Група", "Курс", "Інститут", "Email", "Telegram", "Нік"].map((h) => (
                  <th key={h} className="px-4 py-2 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reg.players.map((p, i) => (
                <tr key={i} className="text-lilac-100">
                  <td className="px-4 py-2 text-mute">{p.role}</td>
                  <td className="px-4 py-2 font-medium text-white">{p.fullName}</td>
                  <td className="px-4 py-2">{p.group}</td>
                  <td className="px-4 py-2">{p.course}</td>
                  <td className="px-4 py-2">{p.institute}</td>
                  <td className="px-4 py-2">
                    <a href={`mailto:${p.email}`} className="hover:text-lilac-300">
                      {p.email}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <a href={`https://t.me/${p.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="text-lilac-300 hover:underline">
                      {p.telegram}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-mute">{p.nickname || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}
