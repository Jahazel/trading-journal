export interface EntryParams {
  id?: string;
}

export interface CreateEntryBody {
  entryTime: string;
  notes: string;
}

export interface UpdateEntryBody {
  entryTime?: string;
  notes?: string;
}
