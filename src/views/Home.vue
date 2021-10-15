<template>
  <div class="home">
    <Calendar msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Calendar from '@/components/Calendar.vue'; // @ is an alias to /src

@Options({
  components: {
    Calendar,
  },
})
export default class Home extends Vue {}
</script>
