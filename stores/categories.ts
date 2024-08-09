import { defineStore } from "pinia";
import type Categories from "~/types/ICategories";
import type Category from "~/types/ICategory";

export const useCategoriesStore = defineStore("categories", {
  state() {
    return {
      categories: <Categories>{
        income: <Array<Category>>[],
        outcome: <Array<Category>>[]
      }
    };
  },
  actions: {
    setCategories(categories: Categories) {
      this.categories.income = categories.income;
      this.categories.outcome = categories.outcome;
    },
    async fetchCategories() {
      const client = useSupabaseClient();
      let { data: rawCates, error } = await client.from("categories").select("*") as {
        data: Category[] | null,
        error: any
      };
      if (error) {
        console.log(error);
      } else {
        this.categories.income = rawCates!.filter(cate => cate.type === "income");
        this.categories.outcome = rawCates!.filter(cate => cate.type === "outcome");
      }
    }
  }
});
