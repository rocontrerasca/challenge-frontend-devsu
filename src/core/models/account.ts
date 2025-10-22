export interface AccountCreateDto {
  accountNumber: string;
  accountType: number; 
  initialBalance: number;
  active: boolean;
  clientRefId: string;
}

export interface AccountUpdateDto {
  accountId: string;
  accountNumber: string;
  accountType: number;
  active: boolean;
}

export interface AccountClientEmbedded {
  password: string;
  fullName: string;
  gender: 'M' | 'F';
  age: number;
  identificationNumber: string;
  address: string;
  phoneNumber: string;
}

export interface AccountMovementEmbedded {
  moveType: number;
  amount: number;
  accountRefId: string;
}

export interface AccountResponseDto {
  accountId: string;
  accountNumber: string;
  accountType: number;
  initialBalance: number;
  active: boolean;
  clientRefId: string;
  client?: AccountClientEmbedded;
  movements?: AccountMovementEmbedded[];
  createdAt?: string;
  updatedAt?: string;
}
