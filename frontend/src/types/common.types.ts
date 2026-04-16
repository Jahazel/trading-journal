import { NoTradeEntry } from "./noTradeEntry.types";
import { TradeEntry } from "./tradeEntry.types";

export interface Message {
  message: string;
}

export interface TradeEntryWithType extends TradeEntry {
  type: "trades";
  entryDate: string;
}

export interface NoTradeEntryWithType extends NoTradeEntry {
  type: "noTrades";
  entryDate: string;
}

export interface TextEditorProps {
  content?: string;
  onChange?: (getNotes: string) => void;
  onSave?: (getNotes: string, fieldType: string) => void;
}

export type SidebarEntry = TradeEntryWithType | NoTradeEntryWithType;
