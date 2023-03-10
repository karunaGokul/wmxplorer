<template>
  <div class="overlay">
    <div class="dialog" style="width: 33%">
      <div class="dialog__header">
        <div class="dialog__header--title">
          <h3>Edit Account</h3>
          <span class="pa--left-1">
            ({{ result.accountNumber }} - {{ result.accountName }})
          </span>
        </div>
        <span class="dialog__header--clear" @click.stop.prevent="close()">
          <i class="fas fa-times fa-lg"></i>
        </span>
      </div>
      <div class="dialog__content text--align-left">
        <div class="pa--y-2">Payment Method</div>
        <select
          class="pa-1"
          v-model="request.paymentMethod"
          style="width: 100%"
          @change="update()"
        >
          <option
            v-for="(item, index) in paymentMethod"
            :key="index"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
        <div v-if="request.paymentMethod == 'DEBIT'">
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
          v-if="request.paymentMethod == 'DEBIT' && request.paymentInstitution"
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
        <div class="pa--y-2">Invoice Group</div>
        <select
          class="pa-1"
          v-model="selectedInvoiceGroup"
          style="width: 100%"
          @change="update()"
        >          
          <option
            v-for="(item, index) in invoiceGroups"
            :key="index"
            :value="item.name"                       
          >
            {{ item.name }}
          </option>
        </select>
      </div>
      <div class="row dialog__footer pa--y-2">
        <div class="column-5"></div>
        <div class="column-7 display--flex justify-content--end">
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
            :disabled="!isUpdate"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  AccountModel,
  DataRequest,
  HouseHoldSearchModel,
  IListService,
  InvoiceGroupModel,
  ListItem,
} from "@/model";
import { Component, Inject, Prop } from "vue-property-decorator";

import { IHouseHoldService, IPaymentAccountService } from "@/service";
import AutoComplete, {
  AutoCompleteData,
} from "@/components/controls/AutoComplete.vue";
import { BaseComponent } from "@/components";

@Component({
  components: { AutoComplete },
})
export default class EditHousehold extends BaseComponent {
  @Prop() result: AccountModel;
  @Inject("householdService")
  householdSearch: IListService<HouseHoldSearchModel>;
  @Inject("paymentService") paymentService: IPaymentAccountService;
  @Inject("householdService") householdService: IHouseHoldService;

  public paymentInstitutions: Array<string> = [];
  public paymentMethod: Array<string> = ["DEBIT", "INVOICE"];
  public invoiceGroups: Array<InvoiceGroupModel> =  [];
  public searchBillToAccountData: AutoCompleteData = null;
  public request: AccountModel = new AccountModel();
  public isUpdate: boolean = false;
  public selectedInvoiceGroup:string=null;
  
  mounted() {
    this.request = this.$vuehelper.clone(this.result);
    this.selectedInvoiceGroup=this.request.invoiceGroup.name;
    this.paymentService.getAllPaymentInstitutions().then((response) => {
      this.paymentInstitutions = response;
    });
    let invoiceReduest = new DataRequest();
    this.householdService.getInvoiceGroup(invoiceReduest).then((response) => {
      this.invoiceGroups = response;  
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
    this.searchBillToAccountData.label = this.result.billToAccount
      ? this.result.billToAccount
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
    this.request.billToAccount = this.result.billToAccount;
    this.update();
  }

  public onSearchFocused(value: boolean) {
    this.update(value);
  }

  public onSearchOut() {   
    if (this.result.billToAccount) this.isUpdate = true;
  }

  public update(value?: boolean) {   
    this.request.invoiceGroup=this.invoiceGroups.find((i:any)=>i.name==this.selectedInvoiceGroup);        
    if (JSON.stringify(this.request) === JSON.stringify(this.result))
      this.isUpdate = false;
    else {
      if (
        this.request.paymentMethod == "DEBIT" &&
        (!this.request.paymentInstitution || !this.request.billToAccount)
      )
        this.isUpdate = false;
      else if (value != undefined) this.isUpdate = value;
      else this.isUpdate = true;
    }
  }

  public close() {
    this.$emit("onClose");
  }

  public save() {
    this.householdService.accountChanges(this.request).then((response) => {      
      this.$emit("onSave");
    },
      (error) => {
        this.alert(
          `Error! Something went wrong. Please contact administrator.`,
          "Error",
          "error"
        );
      });
  }
}
</script>

