interface StatusLabel {
  good: string[];
  bad: string[];
  meh: string[];
}

export function GetRandomStatusLabel(status: keyof StatusLabel): string {
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
    "Don't swim",
    "I'm brown, da ba dee da ba di.",
    "It's lumpy out there.",
    "Did someone say coco pops?",
    "I wouldn't.",
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
  ],
};
