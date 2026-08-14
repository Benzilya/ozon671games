export type StoryTone = "red" | "blue" | "green" | "gray";
export type StoryStatus = "Завершено" | "Продолжается" | "Статус не подтверждён";
export type StoryLength = "Короткая" | "Средняя" | "Длинная" | "Не указано";

export type StoryRecord = {
  slug: string;
  title: string;
  code: string;
  genre: string;
  series: string;
  status: StoryStatus;
  formats: string[];
  year: string;
  length: StoryLength;
  tone: StoryTone;
  description: string;
  featured?: boolean;
  metadataNote: string;
};

const demoNote = "Демонстрационные метаданные интерфейса. Официальные значения должны поступать из подтверждённого источника или CMS.";

export const stories: StoryRecord[] = [
  {
    slug: "tihiy-den",
    title: "Тихий Дэн",
    code: "TD",
    genre: "Криминальная история",
    series: "Вселенная 671",
    status: "Статус не подтверждён",
    formats: ["Аудио", "Видео", "Книга"],
    year: "Не указано",
    length: "Не указано",
    tone: "red",
    featured: true,
    description: "История обычного мойщика полов, чья жизнь навсегда изменилась после цепочки загадочных событий.",
    metadataNote: demoNote,
  },
  { slug: "nochnoe-taksi", title: "Ночное такси", code: "NT", genre: "Мистика", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио", "Видео"], year: "Не указано", length: "Не указано", tone: "blue", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "sirius-6b", title: "Сириус 6Б", code: "S6", genre: "Фантастика", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио", "Книга"], year: "Не указано", length: "Не указано", tone: "blue", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "yozhlesovo", title: "Ёжлесово", code: "EZ", genre: "Мистика", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио"], year: "Не указано", length: "Не указано", tone: "green", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "kuryer", title: "Курьер", code: "KR", genre: "Городская история", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио", "Видео"], year: "Не указано", length: "Не указано", tone: "red", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "kvartira-101", title: "Квартира 101", code: "101", genre: "Хоррор", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио"], year: "Не указано", length: "Не указано", tone: "gray", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "voda-sredi-nas", title: "Вода среди нас", code: "WS", genre: "Мистика", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио"], year: "Не указано", length: "Не указано", tone: "blue", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "temnoe-zlo", title: "Тёмное зло", code: "TZ", genre: "Хоррор", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио"], year: "Не указано", length: "Не указано", tone: "red", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "bezdna-vechnosti", title: "Бездна вечности", code: "BV", genre: "Фантастика", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио"], year: "Не указано", length: "Не указано", tone: "blue", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
  { slug: "bolnitsa-286", title: "Больница 286", code: "286", genre: "Хоррор", series: "Вселенная 671", status: "Статус не подтверждён", formats: ["Аудио", "Видео"], year: "Не указано", length: "Не указано", tone: "gray", description: "Описание будет добавлено после подтверждения редакционных материалов.", metadataNote: demoNote },
];

export const featuredStories = stories.slice(0, 6);
export const quietDan = stories[0];

export function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}
