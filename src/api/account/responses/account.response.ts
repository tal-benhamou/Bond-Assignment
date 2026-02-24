export interface AccountResponse {
  accountId: number;
  personId: number;
  balance: number;
  dailyWithdrawalLimit: number;
  activeFlag: boolean;
  accountType: number;
  createDate: Date;
}

export interface BalanceResponse {
  accountId: number;
  balance: number;
}

export interface TransactionResponse {
  transactionId: number;
  accountId: number;
  value: number;
  transactionDate: Date;
}
