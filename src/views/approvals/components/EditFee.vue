<template>
  <div class="overlay">
    <div
      class="dialog"
      :style="{
        width: dialogWidth ? dialogWidth : '500px',
      }"
    >
      <div class="dialog__header">
        <div class="dialog__header--title">
          <h3>{{ selectedOption }}</h3>
          <span class="pa--left-1">
            ({{ item.accountNumber }} -
            {{ item.billingPeriodName }}
            <span v-if="selectedOption != 'Edit Account'">
              -{{ item.billingEvent }})
            </span>
          </span>
        </div>
        <span class="dialog__header--clear" @click.stop.prevent="close()">
          <i class="fas fa-times fa-lg"></i>
        </span>
      </div>
      <div class="dialog__content text--align-left">
        <div v-if="selectedOption != 'Adjust Fee'">
          <div v-if="selectedOption == 'Edit Account'">
            <div class="pa--y-2">Payment Method</div>
            <select
              class="pa-1"
              v-model="request.paymentMethod"
              style="width: 100%"
              @change="update()"
            >
              <option
                v-for="(item, index) in paymentMethods"
                :key="index"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div
            v-if="
              selectedOption == 'Update Bill-To' ||
              request.paymentMethod == 'Debit'
            "
          >
            <div class="pa--y-2">Payment Institution</div>
            <select
              class="pa-1"
              v-model="request.paymentInstitution"
              style="width: 100%"
              @change="updatePaymentInstitution()"
            >
              <option
                v-for="(item, index) in paymentInstitutions"
                :key="index"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div
            v-if="
              selectedOption == 'Update Bill-To' ||
              (request.paymentMethod == 'Debit' && request.paymentInstitution)
            "
          >
            <div class="pa--y-2">Bill To Account</div>
            <auto-complete
              :data="searchBillToAccountData"
              v-if="searchBillToAccountData"
              @onChanged="onSearchChange($event)"
              @onCanceled="onSearchCancel"
              @onFocused="onSearchFocused($event)"
              @onSearchOut="onSearchOut"
            />
          </div>
          <div v-if="selectedOption == 'Edit Account'">
            <div class="pa--y-2">Invoice Group</div>
            <select
              class="pa-1"
              v-model="request.invoiceGroupName"
              style="width: 100%"
              @change="update()"
            >
              <option
                v-for="(item, index) in invoiceGroups"
                :key="index"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
        </div>        
      </div>
      <div class="row dialog__footer pa--y-2">
        <div
          class="column-5"
          :class="{
            'column-7': selectedOption == 'Adjust Fee',
          }"
        ></div>
        <div
          class="column-7 display--flex justify-content--end"
          :class="{
            'column-5': selectedOption == 'Adjust Fee',
          }"
        >
          <button
            type="button"
            class="btn btn--outline"
            @click.stop.prevent="close()"
            style="border: solid 1px #989797"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn--primary"
            @click.stop.prevent="save()"
            :disabled="!isUpdateApproval"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { BaseComponent } from "@/components";
import AutoComplete, {
  AutoCompleteData,
} from "@/components/controls/AutoComplete.vue";
import {
  DataRequest,
  FeeReportModel,
  HouseHoldSearchModel,
  IListService,
  InvoiceGroupModel,
  ListItem,
} from "@/model";
import { IHouseHoldService, IPaymentAccountService } from "@/service";
import EditHousehold from "@/views/households/components/EditHousehold.vue";
import { Component, Vue, Inject, Prop } from "vue-property-decorator";
@Component({
  components: { AutoComplete, EditHousehold },
})
export default class EditFee extends BaseComponent {
  @Prop() item: FeeReportModel;
  @Prop() selectedOption: string;
  @Prop() dialogWidth: number;
 
  @Inject("householdService")
  householdSearch: IListService<HouseHoldSearchModel>;
  @Inject("paymentService") paymentService: IPaymentAccountService;
  @Inject("householdService") householdService: IHouseHoldService;

  public paymentInstitutions: Array<string> = [];
  public paymentMethods: Array<string> = ["Debit", "Invoice"];
  public invoiceGroups: Array<InvoiceGroupModel> = [];
  public searchBillToAccountData: AutoCompleteData = null;
  public request: FeeReportModel = new FeeReportModel();
  public isUpdateApproval: boolean = false;
 
  mounted() {
    this.request = this.$vuehelper.clone(this.item);
    this.paymentService.getAllPaymentInstitutions().then((response) => {
      this.paymentInstitutions = response;
    });
    let invoiceReduest = new DataRequest();
    this.householdService.getInvoiceGroup(invoiceReduest).then((response) => {
      this.invoiceGroups = response.map((i: any) => i.name);
    });
    if (this.request.paymentInstitution) this.buildBillToAccountData();
  }

  public updatePaymentInstitution() {
    if (this.request.paymentInstitution) this.buildBillToAccountData();
    this.update();
  }

  public buildBillToAccountData() {
    let request = new HouseHoldSearchModel();
    request.paymentInstitution = this.request.paymentInstitution;
    this.searchBillToAccountData = new AutoCompleteData();
    this.searchBillToAccountData.label = this.item.billToAccount
      ? this.item.billToAccount
      : "Search Bill To Account";
    this.searchBillToAccountData.ignoreEmptySearch = true;
    this.searchBillToAccountData.showLabel = true;
    this.searchBillToAccountData.request = request;
    this.searchBillToAccountData.service = this.householdSearch;
  }

  public onSearchChange(item: ListItem) {
    this.request.billToAccount = item.text;
    this.update();
  }

  public onSearchCancel() {
    this.request.billToAccount = this.item.billToAccount;
    this.update();
  }

  public onSearchFocused(value: boolean) {
    this.update(value);
  }

  public onSearchOut() {
    if (this.item.billToAccount) this.isUpdateApproval = true;
  }

  public update(value?: boolean) {
    if (JSON.stringify(this.request) === JSON.stringify(this.item))
      this.isUpdateApproval = false;
    else {
      if (
        this.request.paymentMethod == "Debit" &&
        (!this.request.paymentInstitution || !this.request.billToAccount)
      )
        this.isUpdateApproval = false;
      else if (value != undefined) this.isUpdateApproval = value;
      else this.isUpdateApproval = true;
    }
  }

  public save() {    
    this.$emit("onSave",this.request);     
  }

  public close() {
    this.$emit("onClose");
  }
}
</script>

