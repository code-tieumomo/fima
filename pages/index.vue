<script setup lang="ts">
import type IExpense from "~/types/IExpense";
import { useDialog, useMessage } from "naive-ui";

useHead({
  title: "Fima"
});

const expensesStore = useExpensesStore();
const walletsStore = useWalletsStore();
const dialog = useDialog();
const message = useMessage();

const isFetching = ref(true);
const balance = ref(0);

const totalExpense = computed(() => {
  return expensesStore.expenses
    .filter((expense) => expense.transaction_type === "outcome")
    .reduce((acc, expense) => acc + expense.amount, 0);
});

const totalIncome = computed(() => {
  return expensesStore.expenses
    .filter((expense) => expense.transaction_type === "income")
    .reduce((acc, expense) => acc + expense.amount, 0);
});

const deleteExpense = async (item: IExpense) => {
  dialog.warning({
    title: "Xóa chi tiêu",
    content: "Bạn có chắc chắn muốn xóa chi tiêu này? Hành động này không thể hoàn tác.",
    positiveText: "Xóa",
    negativeText: "Không xóa",
    onPositiveClick: async () => {
      const isDeleted = await expensesStore.deleteExpense(item);
      if (isDeleted) {
        message.success("Xóa chi tiêu thành công");
      } else {
        message.error("Xóa chi tiêu thất bại");
      }
    }
  });
};

watch(() => expensesStore.currentMonth, async () => {
  isFetching.value = true;
  await expensesStore.fetchExpenses();
  isFetching.value = false;
});

onMounted(async () => {
  Promise.all([
    expensesStore.fetchExpenses(),
    expensesStore.fetchAllCompactExpenses(),
    walletsStore.fetchWallets()
  ]).then(() => {
    balance.value = walletsStore.wallets.reduce((acc, wallet) => acc + wallet.initial_amount, 0)
      + expensesStore.compactExpenses.reduce((acc, expense) => {
        return expense.transaction_type === "income" ? acc + expense.amount : acc - expense.amount;
      }, 0);
  });
  isFetching.value = false;
});
</script>

<template>
  <div class="flex flex-col p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-base font-bold">Xin chào!</h1>
      <Icon name="hugeicons:notification-02" class="h-6 w-6"/>
    </div>

    <div class="mt-4 rounded-lg bg-gradient-to-bl from-lime-400 via-green-600 to-teal-700 p-4">
      <div class="flex items-center justify-between">
        <span class="text-white">Số dư còn lại</span>
        <NuxtLink to="/wallets">
          <NTag size="small" round class="text-emerald-600">Xem ví</NTag>
        </NuxtLink>
      </div>
      <div class="mt-2 text-2xl text-white">
        <NNumberAnimation
          show-separator
          :from="0"
          :to="balance"
          :active="true"
          :duration="1000"
        />
        VND
      </div>
      <div class="mt-4 flex items-center gap-1 text-xs text-white underline">
        <Icon name="hugeicons:money-exchange-01" class="h-5 w-5"/>
        Hiển thị ví tiết kiệm
      </div>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <NButton class="grow" type="primary">Phân tích</NButton>
      <NButton class="grow" type="default">Ngân sách</NButton>
    </div>

    <div class="mt-8 flex items-center justify-evenly">
      <Icon name="hugeicons:arrow-left-double" size="30" class="cursor-pointer text-gray-500"
            @click="expensesStore.goToPrevMonth"/>
      <NDatePicker v-model:value="expensesStore.currentMonth" type="month" class="max-w-32"/>
      <Icon name="hugeicons:arrow-right-double" size="30" class="cursor-pointer text-gray-500"
            @click="expensesStore.goToNextMonth"/>
    </div>

    <div class="mt-4">
      <Transition name="page" mode="out-in">
        <div v-if="isFetching" class="flex justify-center">
          <Icon name="svg-spinners:3-dots-scale" size="40" class="text-gray-300"/>
        </div>
        <div v-else class="space-y-2">
          <div class="border rounded-lg flex flex-wrap divide-x divide-y">
            <div class="flex w-1/2 flex-col items-center p-2 text-center">
              <span>Chi tiêu</span>
              <div class="mt-1 font-semibold text-red-600">{{ totalExpense.toLocaleString() }} VND</div>
            </div>
            <div class="flex w-1/2 flex-col items-center p-2 text-center">
              <span>Thu nhập</span>
              <div class="mt-1 font-semibold text-emerald-600">{{ totalIncome.toLocaleString() }} VND</div>
            </div>
            <div class="flex w-full flex-col items-center p-2 text-center">
              <span>Tổng cộng</span>
              <div class="mt-1 font-semibold"
                   :class="{ 'text-emerald-600': totalIncome - totalExpense > 0, 'text-red-600': totalIncome - totalExpense < 0 }">
                {{ (totalIncome - totalExpense).toLocaleString() }} VND
              </div>
            </div>
          </div>
          <div v-for="item in expensesStore.expenses" :key="item.id" class="rounded border p-2 shadow-sm">
            <div class="flex items-center gap-2">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-tl from-green-700 via-teal-800 to-cyan-900">
                <Icon name="hugeicons:shopping-bag-02" class="h-6 w-6 text-white"/>
              </div>
              <div class="grow max-w-[calc(100%-4rem)]">
                <div class="flex items-center justify-between">
                  <NTag size="small" :type="item.transaction_type == 'outcome' ? 'error' : 'success'">
                    {{ item.type.toUpperCase() }}
                  </NTag>
                  <div class="text-right font-semibold"
                       :class="{ 'text-red-500': item.transaction_type == 'outcome', 'text-emerald-500': item.transaction_type == 'income' }">
                    {{ item.transaction_type == "outcome" ? "-" : "+" }}
                    {{ item.amount.toLocaleString("en-US") }} VND
                  </div>
                </div>
                <p class="truncate mt-2 text-gray-400 text-xs">
                  {{ item.description || "No description" }}</p>
              </div>
            </div>
            <div class="mt-2 flex gap-4 justify-between">
              <p class="text-xs text-gray-600">
                Vào ngày <strong>{{ item.date }}</strong>
              </p>
              <Icon name="hugeicons:delete-02" size="16" class="inline-block text-gray-500 cursor-pointer"
                    @click="deleteExpense(item)"/>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>

</style>
