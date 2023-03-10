<template>
  <span class="help">
    <span class="help__trigger show-icon" v-if="id"></span>
    <span class="help__trigger" v-else-if="data">
      <i
        class="fa fa-exclamation-triangle"
        style="color: red"
        v-tooltip-position="position"
      ></i>
    </span>
    <div class="help__content" :class="position" v-if="id" style="position: absolute;">
      <div v-html="getData(id)"></div>
    </div>
    <div class="help__content" v-if="data">
      <div v-html="data"></div>
    </div>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class AppHelp extends Vue {
  @Prop() data: any;
  @Prop({ default: 0 }) id: number;
  @Prop() position: string;

  getData(id: string) {
    let h = this.$store.getters.settings.help;

    if (h) return h[id];

    return "";
  }
}
</script>