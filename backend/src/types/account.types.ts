export interface AccountParams {
  id?: string;
}

export interface CreateAccountBody {
  accountName: string;
  startingBalance: number;
  type: "personal" | "funded";
}

export interface UpdateAccountBody {
  accountName?: string;
  startingBalance?: number;
  status?: "active" | "inactive" | "closed";
  type?: "personal" | "funded";
}
