export const INSTITUTES = [
  { value: "it", label: "ННІ інформаційних технологій" },
  { value: "ep", label: "ННІ економіки і права" },
  { value: "mm", label: "ННІ менеджменту і маркетингу" },
  { value: "ir", label: "ННІ міжнародних відносин" },
  { value: "ffc", label: "Факультет підготовки іноземних громадян" },
] as const;

export const COURSES = [
  { value: "1", label: "1 курс" },
  { value: "2", label: "2 курс" },
  { value: "3", label: "3 курс" },
  { value: "4", label: "4 курс" },
  { value: "m1", label: "1 курс магістратури" },
  { value: "m2", label: "2 курс магістратури" },
] as const;

export const IN_KHARKIV = [
  { value: "yes", label: "Так, у Харкові" },
  { value: "no", label: "Ні, не в Харкові" },
] as const;

export type InstituteValue = (typeof INSTITUTES)[number]["value"];
export type CourseValue = (typeof COURSES)[number]["value"];
export type InKharkivValue = (typeof IN_KHARKIV)[number]["value"];

export const instituteValues = INSTITUTES.map((i) => i.value) as [InstituteValue, ...InstituteValue[]];
export const courseValues = COURSES.map((c) => c.value) as [CourseValue, ...CourseValue[]];
export const inKharkivValues = IN_KHARKIV.map((o) => o.value) as [InKharkivValue, ...InKharkivValue[]];

export function labelOf<T extends { value: string; label: string }>(list: readonly T[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}
