// Form field styles (NewTradeEntry, NewNoTradeEntry)
export const formInputStyles =
  "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink-primary outline-none transition-colors focus:border-accent font-inherit";
export const formSelectStyles = `${formInputStyles} cursor-pointer`;
export const formLabelStyles =
  "block text-sm font-medium text-ink-secondary mb-1.5";
export const formErrorStyles = "block text-xs text-red-500 mt-1";

// Calendar nav button
export const calendarNavBtnStyles =
  "bg-transparent border border-border text-ink-secondary rounded-md px-4 py-2.5 text-sm cursor-pointer transition-all hover:border-accent hover:text-accent min-h-[44px]";

// Detail view row styles (TradeEntryDetail, NoTradeEntryDetail)
export const detailRowStyles =
  "flex items-center min-h-[44px] border-b border-border cursor-pointer gap-4 hover:bg-surface-alt hover:mx-[-32px] hover:px-8";
export const detailLabelStyles =
  "text-sm text-ink-secondary w-30 min-w-30 font-medium";
export const detailValueStyles = "flex-1 text-sm text-ink-primary";
export const detailInputStyles =
  "font-inherit text-sm text-ink-primary bg-surface-alt border border-border rounded-md outline-none transition-colors focus:border-accent px-2 py-1 w-full";
