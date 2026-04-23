export interface CreateAccountData {
  accountName: string;
  startingBalance: number;
  type: "personal" | "funded";
}

export interface Account extends CreateAccountData {
  _id: string;
  userId: string;
  status: "active" | "inactive" | "closed";
  createdAt: string;
  updatedAt: string;
}
