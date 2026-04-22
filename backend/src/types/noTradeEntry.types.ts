export interface EntryParams {
  id?: string;
}

export interface CreateEntryBody {
  accountId: string;
  entryTime: string;
  notes: string;
}

export interface UpdateEntryBody {
  accountId: string;
  entryTime?: string;
  notes?: string;
}
