import { Notice, PageTitle } from "./ui";

export function StoreMissing({ title }: { title: string }) {
  return (
    <>
      <PageTitle title={title} />
      <Notice tone="warn">
        Редагування вимкнене: на хостингу адмінка зберігає зміни комітами в GitHub. Задай у змінних середовища{" "}
        <code className="font-mono">GITHUB_TOKEN</code> (fine-grained, доступ Contents: Read and write до репозиторію),{" "}
        <code className="font-mono">GITHUB_REPO</code> (owner/repo) і, якщо гілка не <code className="font-mono">main</code>,{" "}
        <code className="font-mono">GITHUB_BRANCH</code>. Інструкція в README.
      </Notice>
    </>
  );
}

export function LoadError({ title, error }: { title: string; error: string }) {
  return (
    <>
      <PageTitle title={title} />
      <Notice tone="error">{error}</Notice>
    </>
  );
}
