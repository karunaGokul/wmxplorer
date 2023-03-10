<template>
  <div class="amount-range">
    <label class="amount-range__label">
      <template
        v-if="
          label == 'Fee Amount' ||
          label == 'Annualized Fee Rate' ||
          label == 'Fee Amount Variance' ||
          label == 'Total Fee'
        "
      >
        Fee
      </template>
      <template
        v-else-if="label == 'Fee AUM Variance' || label == 'Billable AUM'"
      >
        AUM
      </template>
      <template v-else-if="label == 'Available Funds'"> Funds </template>
      <template v-else>Assets</template>
    </label>
    <div class="form-input form-input--dense">
      <select v-model="data.operator">
        <option
          v-for="(item, index) of data.ranges"
          :key="index"
          :value="item.value"
        >
          {{ item.text }}
        </option>
      </select>
    </div>
    <div class="form-input form-input--dense">
      <div
        class="display--flex align-items-sm--center"
        v-if="
          label == 'Fee Amount Variance' ||
          label == 'Fee AUM Variance' ||
          label == 'Annualized Fee Rate'
        "
      >
        <input
          type="text"
          v-model="data.amount"
          :style="{
            width: label == 'Annualized Fee Rate' ? '50%' : '30%',
          }"
        />
        <span class="pa-1" v-if="label != 'Annualized Fee Rate'"> % </span>
      </div>
      <div class="form-input__currency" v-else>
        <input type="text" v-model="data.amount" style="width: 50%" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IBaseRequest, ListItem } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class AmountRange extends Vue {
  @Prop() label: string;
  @Prop({ required: true, default: () => new AmountRangeData() })
  data: AmountRangeData;

  created() {
    if (
      this.label == "Fee Amount Variance" ||
      this.label == "Fee AUM Variance"
    ) {
      this.data.ranges = [];
      this.data.ranges.push(new ListItem("varied by at least", "><"));
      this.data.ranges.push(new ListItem("decreased by at least", "<="));
      this.data.ranges.push(new ListItem("increased by at least", ">="));
    }
    if (!this.data.operator) this.data.operator = this.data.ranges[0].value;
  }
}

export class AmountRangeData {
  operator: string;
  amount: number;
  text: string;
  valueOf: string;
  ranges: Array<ListItem>;

  get valid(): boolean {
    return this.operator && this.amount > 0;
  }

  constructor() {
    this.ranges = [];
    this.ranges.push(new ListItem("greater than or equal to", ">="));
    this.ranges.push(new ListItem("less than or equal to", "<="));
  }
}
</script>