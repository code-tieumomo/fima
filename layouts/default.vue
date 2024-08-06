<script setup lang="ts">
import { NMessageProvider } from "naive-ui";

const notFirstTime = useCookie("not_first_time");

const start = () => {
  notFirstTime.value = (new Date()).getTime().toString();
};
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
      <NMessageProvider>
        <slot/>
      </NMessageProvider>
    </div>
    <div class="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 bg-white border-t shadow-2xl">
      <NuxtLink to="/" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:home-01" size="20"/>
        Home
      </NuxtLink>
      <NuxtLink to="/create" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:pie-chart" size="20"/>
        Analysis
      </NuxtLink>
      <NuxtLink to="/create" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:money-bag-02" size="20"/>
        Budgets
      </NuxtLink>
      <NuxtLink to="/create" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:wallet-02" size="20"/>
        Wallets
      </NuxtLink>
      <NuxtLink to="/categories" class="flex flex-col items-center gap-1 text-xs">
        <Icon name="hugeicons:all-bookmark" size="20"/>
        Categories
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-emerald-600;
}
</style>
