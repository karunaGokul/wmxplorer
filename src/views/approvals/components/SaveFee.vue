<template>
  <div class="overlay">
    <div class="dialog" style="width: 33%">
      <div class="dialog__content row text--align-center">
        <div class="column-11 pa-2">
          <i class="fas fa-7x fa-exclamation-triangle" style="color: #f58a07">
          </i>
          <h3 class="pa--y-2">Confirmation</h3>
          <div style="line-height: 1.6">
            {{ $store.getters.billToAccountConfirmMessage }}
          </div>
        </div>
        <div class="column-1 pa-1">
          <span class="dialog__header--clear" @click.stop.prevent="cancel()">
            <i class="fas fa-times fa-lg"></i>
          </span>
        </div>
      </div>
      <div class="dialog__footer text--align-center">
        <button
          type="button"
          class="btn btn--outline"
          @click.stop.prevent="cancel()"
          style="border: solid 1px #989797"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn--primary"
          @click.stop.prevent="saveConfirm()"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { BaseComponent } from "@/components";
import { FeeReportModel } from "@/model";
import { IHouseHoldService } from "@/service";

import { Component, Inject, Prop } from "vue-property-decorator";
@Component
export default class SaveFee extends BaseComponent {  
  @Prop() editRequest:FeeReportModel;

  @Inject("householdService") householdService: IHouseHoldService;

  public cancel() {
    this.$emit("onCancel");
  }

  public saveConfirm() {
    // this.householdService.accountChanges(this.editRequest).then(
    //   (response) => {
    //     this.$emit("onSaveConfirm");
    //   },
    //   (error) => {
    //     this.alert(
    //       `Error! Something went wrong. Please contact administrator.`,
    //       "Error",
    //       "error"
    //     );
    //   }
    // );
  }
}
</script>

