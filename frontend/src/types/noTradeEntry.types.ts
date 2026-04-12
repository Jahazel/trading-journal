export interface CreateNoTradeEntryData {
  date: string;
  notes?: string;
}

export interface NoTradeEntry extends CreateNoTradeEntryData {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
