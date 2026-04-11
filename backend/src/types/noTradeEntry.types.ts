export interface EntryParams {
  id?: string;
}

export interface CreateEntryBody {
  date: string;
  notes: string;
}

export interface UpdateEntryBody {
  date?: string;
  notes?: string;
}
