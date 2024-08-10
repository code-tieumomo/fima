export default interface IExpense {
  id: number;
  created_at: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  transaction_type: string;
}
