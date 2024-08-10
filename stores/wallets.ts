import { defineStore } from "pinia";
import type IWallet from "~/types/IWallet";

export const useWalletsStore = defineStore("wallets", {
  state() {
    return {
      wallets: <IWallet[]>[]
    };
  },
  actions: {
    setWallets(wallets: IWallet[]) {
      this.wallets = wallets;
    },
    async fetchWallets() {
      const client = useSupabaseClient();
      let { data: rawWallets, error } = await client.from("wallets").select("*") as {
        data: IWallet[]
        error: any
      };
      if (error) {
        console.log(error);
      } else {
        this.setWallets(rawWallets);
      }
    }
  }
});
