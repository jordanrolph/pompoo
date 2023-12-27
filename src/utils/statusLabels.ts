import {
  minutesToFullHoursOrDays,
  minutesToPrettyFormat,
} from "./minutesToPrettyFormat";

export interface StatusLabel {
  good: string[];
  bad: string[];
  meh: string[];
}

export function getRandomStatusLabel(status: keyof StatusLabel): string {
  const list = statusLabel[status];
  const randomItem = list[Math.floor(Math.random() * list.length)];

  return randomItem ?? "";
}

const statusLabel: StatusLabel = {
  good: [
    "All clear.",
    "You can get your head under.",
    "Swim, swim, swim!",
    "It's fine.",
    "Lovely jubbly.",
  ],
  bad: [
    "Don't swim.",
    "I'm brown, da ba dee da ba di.",
    "It's lumpy out there.",
    "Did someone say coco pops?",
    "Proper dodgy.",
    "Yeah, nah.",
    "Whiffy banter.",
    "Ponkysaurus Rex.",
    "Try not to get it in your teeth.",
    "Maybe pretend it's Nutella?",
  ],
  meh: [
    "It should be fine.",
    "At least the sea is big.",
    "It's probably watered down by now.",
    "Maybe don't put your head under?",
    "It's up to you.",
  ],
};

export function getPrettyStatusMessage(
  status: keyof StatusLabel,
  minutesSinceLastDump: number,
  ongoingDumpMinutesDuration: number,
): string {
  const prettyTimeSinceLastDump =
    minutesToFullHoursOrDays(minutesSinceLastDump);
  const prettyDuration = minutesToPrettyFormat(
    ongoingDumpMinutesDuration,
    true,
  );

  if (status === "bad") {
    return `They’ve been firing out non-stop jobbies for the past ${prettyDuration}`;
  }

  if (status === "meh" || status === "good") {
    return `The last dump ended ${prettyTimeSinceLastDump} ago`;
  }

  return "";
}
