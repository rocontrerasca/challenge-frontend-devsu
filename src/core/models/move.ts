export interface MoveCreateDto {
  moveType: 1 | 2;        // 1=Crédito, 2=Débito
  amount: number;
  accountRefId: string;
}

export interface MoveAccountEmbedded {
  accountNumber: string;
  accountType: number;
  initialBalance: number;
  active: boolean;
  clientRefId: string;
}

export interface MoveResponseDto {
  moveId: string;
  transactionDate: string; // ISO
  moveType: 1 | 2;
  amount: number;
  balance: number;
  accountRefId: string;
  success: boolean;
  account: MoveAccountEmbedded;
}
