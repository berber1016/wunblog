<template>
</template>

<script>
export default {
  props: ['slot-key'],
  mounted () {
      this.$page.lastUpdated = this.$page.lastUpdated;
  }
};
</script>