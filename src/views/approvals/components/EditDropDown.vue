<template>
  <div>
    <div
      class="dropdown"
      v-click-outside="clickOutSideDropDown"
      v-if="
        !(
          item.data.status === 'Pending Payment' &&
          item.data.paymentMethod === 'Debit'
        ) && item.data.status != 'Pending Review'
      "
    >
      <span style="cursor: pointer" @click="toggledropdown = !toggledropdown">
        <i class="fas fa-ellipsis-v"> </i>
      </span>
      <ul
        class="dropdown-menu dropdown-menu__left"
        :class="{ show: toggledropdown }"
      >
        <li
          class="dropdown-item border--bottom"
          @click.stop.prevent="editAccount('Update Bill-To')"
          v-if="
            !(
              item.data.status === 'Pending Payment' &&
              item.data.paymentMethod === 'Invoice'
            )
          "
        >
          Update Bill-To
        </li>
        <li
          class="dropdown-item border--bottom"
          @click.stop.prevent="editAccount('Edit Account')"
          v-if="
            !(
              item.data.status === 'Pending Payment' &&
              item.data.paymentMethod === 'Invoice'
            )
          "
        >
          Edit Account
        </li>
        <li
          class="dropdown-item"
          @click.stop.prevent="editAccount('Adjust Fee')"
        >
          Adjust Fee
        </li>        
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { DataTableRowModel } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EditDropDown extends Vue {
  @Prop() item: DataTableRowModel;
  public selectedOption: string = "";
  public toggledropdown: boolean = false;

  public editAccount(option: string) {
    this.selectedOption = option;
    this.$emit("editAccount", this.item, this.selectedOption);
  }

  public clickOutSideDropDown() {
    this.toggledropdown = false;
  }
}
</script>

