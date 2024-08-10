<script setup lang="ts">
import { type FormInst, useMessage } from "naive-ui";

useHead({
  title: "Ví"
});

const message = useMessage();
const client = useSupabaseClient();

const formRef = ref<FormInst | null>(null);
const wallets = ref([]);
const expenses = ref([]);
const showModal = ref(false);
const isSaving = ref(false);

const totalExpense = computed(() => {
  return expenses.value
    .filter((expense) => expense.transaction_type === "outcome")
    .reduce((acc, expense) => acc + expense.amount, 0);
});

const totalIncome = computed(() => {
  const income = expenses.value
    .filter((expense) => expense.transaction_type === "income")
    .reduce((acc, expense) => acc + expense.amount, 0);
  const inititalAmount = wallets.value.reduce((acc, wallet) => acc + wallet.initial_amount, 0);
  return income + inititalAmount;
});

const balance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

const form = reactive({
  id: null,
  name: null,
  initial_amount: null
});

const rules = {
  name: {
    required: true,
    message: "Phải nhập tên ví",
    trigger: "blur"
  },
  initial_amount: {
    required: true,
    message: "Phải nhập số dư ban đầu",
    trigger: "blur",
    type: "number"
  }
};

const parse = (input: string) => {
  const nums = input.replace(/,/g, "").trim();
  if (/^\d+(\.(\d+)?)?$/.test(nums))
    return Number(nums);
  return nums === "" ? null : Number.NaN;
};

const format = (value: number | null) => {
  if (value === null)
    return "";
  return value.toLocaleString("en-US");
};

const editWallet = (wallet) => {
  form.id = wallet.id;
  form.name = wallet.name;
  form.initial_amount = wallet.initial_amount;
  showModal.value = true;
};

const saveWallet = () => {
  formRef.value?.validate(async (errors: Array) => {
    if (errors) {
      message.error(errors[0][0].message);
    } else {
      isSaving.value = true;
      const { data, error } = await client
        .from("wallets")
        .update({ name: form.name, initial_amount: form.initial_amount })
        .eq("id", form.id)
        .select();
      if (error) {
        message.error(error.message);
      } else {
        wallets.value = data;
        message.success("Lưu thành công");
      }
      isSaving.value = false;
    }
  });
};

onMounted(async () => {
  Promise.all([
    client
      .from("wallets")
      .select("*"),
    client
      .from("expenses")
      .select("transaction_type,amount")
  ]).then((values) => {
    const { data: rawWallets, walletError } = values[0];
    if (walletError) {
      console.error(walletError);
    } else {
      wallets.value = rawWallets;
    }

    const { data: rawExpenses, expenseError } = values[1];
    if (expenseError) {
      console.error(expenseError);
    } else {
      expenses.value = rawExpenses;
    }
  });
});
</script>

<template>
  <div>
    <div class="flex flex-col p-4">
      <h1 class="text-lg font-bold">Ví</h1>
      <hr class="my-4">
      <div class="rounded-lg border shadow divide-y">
        <div class="flex divide-x">
          <div class="flex w-1/2 flex-col items-center px-4 py-4">
            <span class="flex items-center gap-1">
              <Icon name="hugeicons:logout-01" size="20"/>
              Tổng chi tiêu</span>
            <div class="mt-2 font-semibold text-red-600">{{ totalExpense.toLocaleString() }} VND</div>
          </div>
          <div class="flex w-1/2 flex-col items-center px-4 py-4">
            <span class="flex items-center gap-1">
              <Icon name="hugeicons:login-01" size="20"/>
              Tổng thu nhập</span>
            <div class="mt-2 font-semibold text-emerald-600">{{ totalIncome.toLocaleString() }} VND</div>
          </div>
        </div>
        <div class="flex items-center justify-center gap-2 px-4 py-2">
          <Icon name="hugeicons:wallet-02" size="20"/>
          Số dư ví:
          <span class="font-bold" :class="{ 'text-emerald-600': balance > 0, 'text-red-600': balance < 0 }">
            {{ balance.toLocaleString() }} VND
          </span>
        </div>
      </div>
      <hr class="my-4">
      <h2 class="font-bold">Danh sách ví</h2>
      <div class="mt-4 flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-2 transition-all hover:shadow"
           v-for="wallet in wallets" @click="editWallet(wallet)">
        <Icon name="hugeicons:wallet-02" size="40" class="text-gray-500"/>
        <div class="flex grow flex-col gap-1">
          <span class="font-semibold">{{ wallet.name }}</span>
          <span class="text-sm text-gray-500">
            Số dư:
            <span class="font-bold"
                  :class="{ 'text-emerald-600': wallet.initial_amount > 0, 'text-red-600': wallet.initial_amount < 0 }">
              {{ wallet.initial_amount.toLocaleString() }} VND
            </span>
          </span>
        </div>
      </div>
    </div>

    <NModal v-model:show="showModal" preset="dialog" title="Chỉnh sửa ví">
      <NForm ref="formRef" :model="form" :rules="rules" class="mt-8">
        <NFormItem label="Tên" path="name">
          <NInput size="large" v-model:value="form.name" placeholder="..."/>
        </NFormItem>
        <NFormItem label="Số dư ban đầu" path="initial_amount">
          <NInputNumber size="large" v-model:value="form.initial_amount" placeholder="..." :parse="parse"
                        :format="format">
            <template #suffix>
              VND
            </template>
          </NInputNumber>
        </NFormItem>
      </NForm>
      <NButton class="w-full" type="primary" @click="saveWallet" :loading="isSaving" :disabled="isSaving">Lưu</NButton>
    </NModal>
  </div>
</template>

<style scoped>

</style>
