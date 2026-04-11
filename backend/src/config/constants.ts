export const POINT_VALUES = {
  NQ: 20,
  MNQ: 2,
  ES: 50,
  MES: 5,
} as const;

export type ContractType = keyof typeof POINT_VALUES;
