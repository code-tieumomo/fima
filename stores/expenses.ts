import { defineStore } from "pinia";
import dayjs from "dayjs";
import type IExpense from "~/types/IExpense";
import type ICompactExpense from "~/types/ICompactExpense";

export const useExpensesStore = defineStore("expenses", {
  state() {
    return {
      currentMonth: <number>(new Date()).getTime(),
      expenses: <IExpense[]>[],
      compactExpenses: <ICompactExpense[]>[]
    };
  },
  actions: {
    goToPrevMonth() {
      this.currentMonth = new Date(this.currentMonth).setMonth(new Date(this.currentMonth).getMonth() - 1);
    },
    goToNextMonth() {
      this.currentMonth = new Date(this.currentMonth).setMonth(new Date(this.currentMonth).getMonth() + 1);
    },
    setExpenses(expenses: IExpense[]) {
      this.expenses = expenses;
    },
    async fetchExpenses() {
      const client = useSupabaseClient();
      const startOfMonth = dayjs(this.currentMonth).startOf("month").format("YYYY-MM-DD");
      const endOfMonth = dayjs(this.currentMonth).endOf("month").format("YYYY-MM-DD");
      const {
        data: rawExpenses,
        error
      } = await client.from("expenses").select("*").gte("date", startOfMonth).lte("date", endOfMonth).order("date", { ascending: false }) as {
        data: IExpense[],
        error: any
      };
      if (error) {
        console.error(error);
      } else {
        this.setExpenses(rawExpenses);
      }
    },
    async fetchAllCompactExpenses() {
      const client = useSupabaseClient();
      const {
        data: rawExpenses,
        error
      } = await client.from("expenses").select("amount, transaction_type").order("date", { ascending: false }) as {
        data: ICompactExpense[],
        error: any
      };
      if (error) {
        console.error(error);
      } else {
        this.compactExpenses = rawExpenses;
      }
    },
    async deleteExpense(expense: IExpense) {
      const client = useSupabaseClient();
      const { error } = await client
        .from("expenses")
        .delete()
        .eq("id", expense.id);
      if (error) {
        console.error(error);
        return false;
      } else {
        await Promise.all([
          this.fetchExpenses(),
          this.fetchAllCompactExpenses()
        ]);
        return true;
      }
    }
  }
});
