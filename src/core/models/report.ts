export interface MoveReportRow {
  transactionDate: string; 
  client: string;
  account: string;   
  accountType: string;   
  amount: number;     
  initialBalance: number;
  success: boolean;
  finalBalance: number;
}
