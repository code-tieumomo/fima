<script setup lang="ts">
import { useMessage } from "naive-ui";

useHead({
  title: "Categories"
});

const client = useSupabaseClient();
const message = useMessage();
const categoriesStore = useCategoriesStore();

const isSaving = ref(false);

const onCreateCate = (label: String, type: String) => {
  return {
    label,
    value: slugify(label),
    type: type
  };
};

const save = async () => {
  isSaving.value = true;
  const rawData = [...categoriesStore.categories.income, ...categoriesStore.categories.outcome].map(cate => {
    return {
      label: cate.label,
      value: cate.value,
      type: cate.type
    };
  });
  await client.from("categories").delete().neq("id", 0);
  const { data, error } = await client
    .from("categories")
    // @ts-ignore
    .insert(rawData)
    .select();
  if (error) {
    message.error(error.message);
  } else {
    message.success("Lưu thành công");
  }
  isSaving.value = false;
};
</script>

<template>
  <div>
    <div class="flex flex-col p-4">
      <h1 class="text-lg font-bold">Danh mục</h1>
      <hr class="my-4">
      <h2 class="text-sm font-semibold">Chi</h2>
      <NDynamicTags class="mt-4" size="large" v-model:value="categoriesStore.categories.outcome"
                    @create="(label: String) => onCreateCate(label, 'outcome')"/>
      <hr class="my-4">
      <h2 class="text-sm font-semibold">Thu</h2>
      <NDynamicTags class="mt-4" size="large" v-model:value="categoriesStore.categories.income"
                    @create="(label: String) => onCreateCate(label, 'income')"/>
      <NButton class="w-full mt-8" type="primary" @click="save" size="large" :loading="isSaving" :disable="isSaving">
        Lưu
      </NButton>
    </div>
  </div>
</template>

<style scoped></style>
