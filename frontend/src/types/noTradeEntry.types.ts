export interface CreateNoTradeEntryData {
  entryTime: string;
  notes?: string;
}

export interface NoTradeEntry extends CreateNoTradeEntryData {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
