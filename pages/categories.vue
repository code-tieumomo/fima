<script setup lang="ts">
useHead({
  title: "Categories"
});

const client = useSupabaseClient();
const message = useMessage();

const outcomeCates = ref([]);
const incomeCates = ref([]);
const isSaving = ref(false);

onMounted(async () => {
  let { data: rawCates, error } = await client.from("categories").select("*");
  outcomeCates.value = rawCates?.filter(cate => cate.type === "outcome");
  incomeCates.value = rawCates?.filter(cate => cate.type === "income");
});

const onCreateCate = (label: String, type: String) => {
  return {
    label,
    slug: slugify(label),
    type: type,
  }
}

const save = async () => {
  isSaving.value = true;
  const rawData = [...outcomeCates.value, ...incomeCates.value].map(cate => {
    return {
      label: cate.label,
      slug: cate.slug,
      type: cate.type,
    }
  });
  const response = await client.from('categories').delete().neq('id', 0);
  const { data, error } = await client
    .from("categories")
    .insert(rawData)
    .select();
  if (error) {
    message.error(error.message);
  } else {
    message.success("Saved successfully");
  }
  isSaving.value = false;
}
</script>

<template>
  <div>
    <div class="flex flex-col p-4">
      <h1 class="text-lg font-bold">Categories</h1>
      <hr class="my-4">
      <h2 class="text-sm font-semibold">Outcomes</h2>
      <NDynamicTags class="mt-4" size="large" v-model:value="outcomeCates" @create="(label) => onCreateCate(label, 'outcome')"/>
      <hr class="my-4">
      <h2 class="text-sm font-semibold">Incomes</h2>
      <NDynamicTags class="mt-4" size="large" v-model:value="incomeCates" @create="(label) => onCreateCate(label, 'income')"/>
      <NButton class="w-full mt-8" type="primary" @click="save" size="large" :loading="isSaving" :disable="isSaving">
        Save
      </NButton>
    </div>
  </div>
</template>

<style scoped></style>
