<script setup lang="ts">
import {
  type FormInst, useMessage
} from "naive-ui";
import dayjs from "dayjs";
import type Category from "~/types/ICategory";

const notFirstTime = useCookie("not_first_time");
const categoriesStore = useCategoriesStore();

const showModal = ref(false);
const isSaving = ref(false);
const bodyStyle = reactive({
  width: "600px",
  height: "100dvh"
});
const segmented = reactive({
  content: "soft",
  footer: "soft"
});
const typeOptions = ref<Category[]>([]);

const start = () => {
  notFirstTime.value = (new Date()).getTime().toString();
};

const getLabel = (value: string) => {
  const option = typeOptions.value.find((item) => item.value === value);
  return option ? option.label : "";
};

const transactionTypeOptions = [
  {
    label: "Khoản chi",
    value: "outcome"
  },
  {
    label: "Khoản thu",
    value: "income"
  }
];

const form = reactive({
  type: null,
  transactionType: "outcome",
  amount: null,
  description: null,
  date: (new Date()).getTime()
});

watch(
  [form, categoriesStore.categories],
  (_) => {
    switch (form.transactionType) {
      case "outcome":
        typeOptions.value = categoriesStore.categories.outcome;
        break;
      case "income":
        typeOptions.value = categoriesStore.categories.income;
        break;
    }
  },
  { immediate: true }
);

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

const rules = {
  date: {
    required: true,
    message: "Phải nhập ngày",
    type: "number"
  },
  type: {
    required: true,
    message: "Phải chọn loại chi tiêu"
  },
  transactionType: {
    required: true,
    message: "Phải chọn loại giao dịch"
  },
  amount: {
    required: true,
    message: "Phải nhập số tiền",
    type: "number"
  }
};

const formRef = ref<FormInst | null>(null);
const message = useMessage();
const client = useSupabaseClient();
const expensesStore = useExpensesStore();

const storeExpense = async () => {
  formRef.value?.validate(async (errors: Array) => {
    if (errors) {
      message.error(errors[0][0].message);
    } else {
      isSaving.value = true;
      const { data: expense } = await client.from("expenses").insert([
        {
          type: form.type,
          transaction_type: form.transactionType,
          amount: form.amount,
          description: form.description,
          date: dayjs(form.date).format("YYYY-MM-DD")
        }
      ]).select();
      await Promise.all([
        expensesStore.fetchExpenses(),
        expensesStore.fetchAllCompactExpenses()
      ]);
      message.success("Thêm chi tiêu thành công");
      showModal.value = false;
      isSaving.value = false;
      navigateTo("/");
    }
  });
};

onMounted(async () => {
  await categoriesStore.fetchCategories();
});
</script>

<template>
  <div>
    <div class="fixed inset-0 z-10 flex flex-col items-center justify-center px-4 bg-white" v-if="!notFirstTime">
      <div class="text-2xl font-bold text-center">
        All-In-One Financial<br>Management Tool
      </div>
      <img class="w-48 mt-8" src="/images/splash.gif" alt="">
      <p class="mt-8 text-sm text-center text-gray-500 max-w-64">
        Easy track your expenses, create a budget and set financial goals to help you stay on top of your money.
      </p>
      <NButton class="w-full mt-8" type="primary" @click="start">
        Get Started
      </NButton>
    </div>
    <div class="mb-20">
      <slot/>
    </div>
    <div class="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 bg-white border-t shadow-2xl">
      <NuxtLink to="/" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:home-01" size="20"/>
        Trang chủ
      </NuxtLink>
      <NuxtLink class="opacity-40 flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:pie-chart" size="20"/>
        Phân tích
      </NuxtLink>
      <NuxtLink class="opacity-40 flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:money-bag-02" size="20"/>
        Ngân sách
      </NuxtLink>
      <NuxtLink to="/wallets" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:wallet-02" size="20"/>
        Ví
      </NuxtLink>
      <NuxtLink to="/categories" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:all-bookmark" size="20"/>
        Danh mục
      </NuxtLink>
    </div>
    <button @click="showModal = true"
            class="fixed flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg right-4 bottom-20 bg-emerald-600">
      <Icon name="hugeicons:add-02" size="24"/>
    </button>
    <NModal v-model:show="showModal" class="custom-card" preset="card" :style="bodyStyle" title="Thêm chi tiêu"
            :bordered="false" size="huge" :segmented="segmented">
      <NForm ref="formRef" :model="form" :rules="rules">
        <NFormItem label="Ngày" path="date">
          <NDatePicker size="large" class="w-full" v-model:value="form.date" type="date" placeholder="..."/>
        </NFormItem>
        <NFormItem label="Danh mục" path="transactionType">
          <NRadioGroup size="large" class="w-full" name="transaction-type" v-model:value="form.transactionType">
            <NRadioButton class="w-1/2 text-center" v-for="item in transactionTypeOptions" :key="item.value"
                          :value="item.value" :label="item.label"/>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="Loại chi tiêu" path="type">
          <NSelect size="large" v-model:value="form.type" :options="typeOptions" placeholder="..."/>
        </NFormItem>
        <NFormItem label="Số tiền" path="amount">
          <NInputNumber size="large" class="w-full" v-model:value="form.amount" placeholder="..." :parse="parse"
                        :format="format">
            <template #suffix>
              VND
            </template>
          </NInputNumber>
        </NFormItem>
        <NFormItem label="Mô tả" path="description">
          <NInput size="large" v-model:value="form.description" type="textarea" placeholder="..."/>
        </NFormItem>
      </NForm>
      <NButton class="w-full" type="primary" @click="storeExpense" :loading="isSaving" :disabled="isSaving">
        Thêm
      </NButton>
    </NModal>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-emerald-600 font-semibold;
}
</style>
