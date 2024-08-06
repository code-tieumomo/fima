<script setup lang="ts">
import { useMessage } from "naive-ui";
import type {
  FormInst,
  FormItemInst,
  FormItemRule,
  FormRules,
  FormValidationError
} from "naive-ui";
import dayjs from "dayjs";

const typeOptions = [
  {
    label: "Ăn uống",
    value: "food"
  },
  {
    label: "Mua sắm",
    value: "shopping"
  },
  {
    label: "Giải trí",
    value: "entertainment"
  },
  {
    label: "Đi lại",
    value: "transport"
  },
  {
    label: "Cố định",
    value: "fixed"
  },
  {
    label: "Vật nuôi",
    value: "pet"
  },
  {
    label: "Sức khỏe",
    value: "health"
  },
  {
    label: "Khác",
    value: "other"
  }
];

const getLabel = (value: string) => {
  const option = typeOptions.find((item) => item.value === value);
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
    trigger: "blur",
    type: "number"
  },
  type: {
    required: true,
    message: "Phải chọn loại chi tiêu",
    trigger: "blur"
  },
  transactionType: {
    required: true,
    message: "Phải chọn loại giao dịch",
    trigger: "blur"
  },
  amount: {
    required: true,
    message: "Phải nhập số tiền",
    trigger: "blur",
    type: "number"
  }
};

const formRef = ref<FormInst | null>(null);
const message = useMessage();
const client = useSupabaseClient();

const storeExpense = async () => {
  formRef.value?.validate(async (errors: Array) => {
    if (errors) {
      message.error(errors[0][0].message);
    } else {
      const { data: expense } = await client.from("expenses").insert([
        {
          type: form.type,
          transaction_type: form.transactionType,
          amount: form.amount,
          description: form.description,
          date: dayjs(form.date).format("YYYY-MM-DD")
        }
      ]).select();
      message.success("Thêm chi tiêu thành công");
    }
  });
};

let { data: rawExpenses, error } = await client.from("expenses").select("*").order("date", { ascending: false });
const expenses = ref(rawExpenses);

const expenseRealtime = client.channel("custom-insert-channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "expenses" },
    (payload) => {
      expenses.value?.push(payload.new);
    }
  )
  .subscribe();
</script>

<template>
  <div class="p-4">
    <NForm ref="formRef" :model="form" :rules="rules">
      <NFormItem label="Ngày" path="date">
        <NDatePicker size="large" class="w-full" v-model:value="form.date" type="date" placeholder="..."/>
      </NFormItem>
      <NFormItem label="Loại chi tiêu" path="type">
        <NSelect size="large" v-model:value="form.type" :options="typeOptions" placeholder="..."/>
      </NFormItem>
      <NFormItem label="Giao dịch" path="transactionType">
        <NRadioGroup size="large" class="w-full" name="transaction-type" v-model:value="form.transactionType">
          <NRadioButton class="w-1/2 text-center" v-for="item in transactionTypeOptions" :key="item.value"
                        :value="item.value" :label="item.label"/>
        </NRadioGroup>
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
    <NButton class="w-full" type="primary" @click="storeExpense">Thêm</NButton>

    <div class="space-y-2 mt-4">
      <div class="border rounded p-2 flex items-center justify-between" v-for="item in expenses" :key="item.id">
        <div>
          <NTag size="small">{{ getLabel(item.type) }}</NTag>
          <div class="text-xs mt-2 text-gray-600">{{ item.date }}</div>
        </div>
        <div>
          <div class="text-lg font-semibold"
               :class="{ 'text-red-500': item.transaction_type == 'outcome', 'text-emerald-500': item.transaction_type == 'income' }">
            {{ item.transaction_type == "outcome" ? "-" : "+" }}
            {{ item.amount.toLocaleString("en-US") }} VND
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
