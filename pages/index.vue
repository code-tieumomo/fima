<script setup lang="ts">
const client = useSupabaseClient();

const expenses = ref([]);

onMounted(async () => {
  let { data: rawExpenses, error } = await client.from("expenses").select("*").order("date", { ascending: false });
  expenses.value = rawExpenses;
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
        <NTag size="small" round class="text-emerald-600">Xem ví</NTag>
      </div>
      <div class="mt-2 text-2xl text-white">
        <NNumberAnimation
          show-separator
          :from="0"
          :to="3245000"
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

    <div class="mt-4">
      <div class="flex items-center justify-between">
        <label class="font-semibold">Giao dịch gần đây</label>
        <NuxtLink class="flex items-center gap-1 underline" to="/">
          Xem tát cả
          <Icon name="hugeicons:arrow-right-01" class="h-4 w-4"/>
        </NuxtLink>
      </div>
      <div class="mt-4 space-y-2">
        <div v-for="item in expenses" :key="item.id" class="rounded border p-2 shadow-sm">
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
              <p class="truncate mt-2 leading-none text-gray-400 text-xs">
                {{ item.description || "No description" }}</p>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-600">Vào ngày <strong>{{ item.date }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
