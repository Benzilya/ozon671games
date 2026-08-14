"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type PlayerChapter = {
  id: string;
  title: string;
  durationSeconds: number;
};

type PersistedPlayerState = {
  chapterId: string;
  positionSeconds: number;
  playbackRate: number;
  volume: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function formatPlayerTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function useLocalPlayer(storageKey: string, chapters: PlayerChapter[]) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepDeadline, setSleepDeadline] = useState<number | null>(null);

  const chapter = chapters[chapterIndex] ?? chapters[0];
  const durationSeconds = chapter?.durationSeconds ?? 1;
  const progressPercent = clamp((positionSeconds / durationSeconds) * 100, 0, 100);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as Partial<PersistedPlayerState>;
        const savedIndex = chapters.findIndex((item) => item.id === saved.chapterId);
        if (savedIndex >= 0) setChapterIndex(savedIndex);
        if (typeof saved.positionSeconds === "number") {
          const savedDuration = chapters[savedIndex >= 0 ? savedIndex : 0]?.durationSeconds ?? durationSeconds;
          setPositionSeconds(clamp(saved.positionSeconds, 0, savedDuration));
        }
        if (typeof saved.playbackRate === "number") setPlaybackRate(clamp(saved.playbackRate, 0.5, 2));
        if (typeof saved.volume === "number") setVolume(clamp(saved.volume, 0, 1));
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [chapters, durationSeconds, storageKey]);

  useEffect(() => {
    const payload: PersistedPlayerState = {
      chapterId: chapter.id,
      positionSeconds,
      playbackRate,
      volume,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [chapter.id, playbackRate, positionSeconds, storageKey, volume]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setPositionSeconds((current) => {
        const next = current + 1 * playbackRate;
        if (next < durationSeconds) return next;
        return durationSeconds;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [durationSeconds, playbackRate, playing]);

  useEffect(() => {
    if (!playing || positionSeconds < durationSeconds) return;
    if (chapterIndex < chapters.length - 1) {
      const nextTimer = window.setTimeout(() => {
        setChapterIndex((index) => Math.min(chapters.length - 1, index + 1));
        setPositionSeconds(0);
      }, 0);
      return () => window.clearTimeout(nextTimer);
    }
    const stopTimer = window.setTimeout(() => setPlaying(false), 0);
    return () => window.clearTimeout(stopTimer);
  }, [chapterIndex, chapters.length, durationSeconds, playing, positionSeconds]);

  useEffect(() => {
    if (sleepDeadline === null) return;
    const remaining = sleepDeadline - Date.now();
    if (remaining <= 0) {
      const stopTimer = window.setTimeout(() => {
        setPlaying(false);
        setSleepMinutes(null);
        setSleepDeadline(null);
      }, 0);
      return () => window.clearTimeout(stopTimer);
    }
    const timer = window.setTimeout(() => {
      setPlaying(false);
      setSleepMinutes(null);
      setSleepDeadline(null);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [sleepDeadline]);

  const seek = useCallback((deltaSeconds: number) => {
    setPositionSeconds((value) => clamp(value + deltaSeconds, 0, durationSeconds));
  }, [durationSeconds]);

  const seekToPercent = useCallback((percent: number) => {
    setPositionSeconds(clamp(percent, 0, 100) / 100 * durationSeconds);
  }, [durationSeconds]);

  const selectChapter = useCallback((index: number, autoplay = true) => {
    setChapterIndex(clamp(index, 0, chapters.length - 1));
    setPositionSeconds(0);
    setPlaying(autoplay);
  }, [chapters.length]);

  const previousChapter = useCallback(() => {
    if (positionSeconds > 5) {
      setPositionSeconds(0);
      return;
    }
    selectChapter(chapterIndex - 1);
  }, [chapterIndex, positionSeconds, selectChapter]);

  const nextChapter = useCallback(() => selectChapter(chapterIndex + 1), [chapterIndex, selectChapter]);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    setPlaybackRate((current) => rates[(rates.findIndex((rate) => rate === current) + 1) % rates.length] ?? 1);
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepMinutes(minutes);
    setSleepDeadline(minutes === null ? null : Date.now() + minutes * 60_000);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "ArrowLeft") seek(-15);
      if (event.key === "ArrowRight") seek(15);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [seek]);

  return useMemo(() => ({
    chapter,
    chapterIndex,
    chapters,
    durationSeconds,
    nextChapter,
    playing,
    playbackRate,
    positionSeconds,
    previousChapter,
    progressPercent,
    seek,
    seekToPercent,
    selectChapter,
    setPlaying,
    setPlaybackRate,
    setSleepTimer,
    setVolume,
    sleepMinutes,
    volume,
    cyclePlaybackRate,
  }), [chapter, chapterIndex, chapters, cyclePlaybackRate, durationSeconds, nextChapter, playbackRate, playing, positionSeconds, previousChapter, progressPercent, seek, seekToPercent, selectChapter, setSleepTimer, sleepMinutes, volume]);
}
