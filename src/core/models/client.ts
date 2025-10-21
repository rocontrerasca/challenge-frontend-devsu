export interface ClientResponseDto {
  clientId: string;
  fullName: string;
  gender: 'M' | 'F';
  age: number;
  identificationNumber: string;
  address: string;
  phoneNumber: string;
  active: boolean;
}

export interface ClientCreateDto {
  fullName: string;
  gender: 'M' | 'F';
  age: number;
  identificationNumber: string;
  address: string;
  phoneNumber: string;
  password: string;
  active: boolean;
}

export interface ClientUpdateDto {
  clientId: string;
  password: string;
  active: boolean;
  fullName: string;
  gender: 'M' | 'F';
  age: number;
  identificationNumber: string;
  address: string;
  phoneNumber: string;
}
