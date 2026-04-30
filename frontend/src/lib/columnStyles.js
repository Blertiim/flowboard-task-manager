export const COLUMN_ACCENTS = [
  {
    value: "coral",
    label: "Coral",
    dotClass: "bg-board-coral",
    softClass: "bg-board-coral/12 text-[#c54a2a]",
    headerClass: "bg-gradient-to-r from-board-coral/18 via-board-coral/8 to-transparent",
    borderClass: "border-board-coral/20"
  },
  {
    value: "ocean",
    label: "Ocean",
    dotClass: "bg-board-ocean",
    softClass: "bg-board-ocean/12 text-board-ocean",
    headerClass: "bg-gradient-to-r from-board-ocean/18 via-board-ocean/8 to-transparent",
    borderClass: "border-board-ocean/20"
  },
  {
    value: "mint",
    label: "Mint",
    dotClass: "bg-board-mint",
    softClass: "bg-board-mint/12 text-[#168f5c]",
    headerClass: "bg-gradient-to-r from-board-mint/18 via-board-mint/8 to-transparent",
    borderClass: "border-board-mint/20"
  },
  {
    value: "amber",
    label: "Amber",
    dotClass: "bg-amber-500",
    softClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
    headerClass: "bg-gradient-to-r from-amber-200/70 via-amber-100/50 to-transparent dark:from-amber-900/30 dark:via-amber-900/10",
    borderClass: "border-amber-300/40 dark:border-amber-800/40"
  },
  {
    value: "rose",
    label: "Rose",
    dotClass: "bg-rose-500",
    softClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
    headerClass: "bg-gradient-to-r from-rose-200/70 via-rose-100/50 to-transparent dark:from-rose-900/30 dark:via-rose-900/10",
    borderClass: "border-rose-300/40 dark:border-rose-800/40"
  },
  {
    value: "violet",
    label: "Violet",
    dotClass: "bg-violet-500",
    softClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200",
    headerClass: "bg-gradient-to-r from-violet-200/70 via-violet-100/50 to-transparent dark:from-violet-900/30 dark:via-violet-900/10",
    borderClass: "border-violet-300/40 dark:border-violet-800/40"
  },
  {
    value: "slate",
    label: "Slate",
    dotClass: "bg-slate-500",
    softClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    headerClass: "bg-gradient-to-r from-slate-200/70 via-slate-100/50 to-transparent dark:from-slate-800/40 dark:via-slate-800/10",
    borderClass: "border-slate-300/40 dark:border-slate-700/40"
  }
];

const accentMap = Object.fromEntries(COLUMN_ACCENTS.map((accent) => [accent.value, accent]));

export function getAccentStyle(accent) {
  return accentMap[accent] || accentMap.slate;
}
