export interface CreateNoTradeEntryData {
  accountId: string;
  entryTime: string;
  notes?: string;
  images?: string[];
}

export interface NoTradeEntry extends CreateNoTradeEntryData {
  _id: string;
  userId: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}
