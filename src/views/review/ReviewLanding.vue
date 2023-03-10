<template>
  <div class="pa--left-2" v-if="response">
    <div class="content__header">
      <router-link to="/" tag="a" class="content__header-back"
        >Back to overview</router-link
      >
      <div class="row no-gutters">
        <div class="column-3">
          <h1 class="content__header-title">Review Billing</h1>
        </div>
        <div class="column-9">
          <filter-component
            :data="filterData"
            :feeRequest="request"
            pageName="Review Billing"
            @applyFilters="onApplyFilters($event)"
            v-if="filterData"
          >
            <template v-slot:info>
              <div class="pa-0" v-if="response.pageInfo.totalResults">
                <span
                  >Showing {{ review.length }} of
                  {{ response.pageInfo.totalResults }}</span
                >
              </div>
            </template>
          </filter-component>
        </div>
      </div>
    </div>
    <div
      class="table table--bordered"
      style="overflow-x: auto"
      v-if="dataResponse"
    >
      <table class="table">
        <thead class="table__head">
          <tr>
            <th
              class="text--align-left"
              v-for="column of dataResponse.columns"
              :key="column.columnOrder"
              :class="{
                'text--align-right':
                  column.columnName == 'feeReportAmount' ||
                  column.columnName == 'marketValue' ||
                  column.columnName == 'totalAUM' ||
                  column.columnName == 'cashAvailable' ||
                  column.columnName == 'priorFeeAmount' ||
                  column.columnName == 'priorFeeMarketValue'||
                  column.columnName == 'annualRate' ||
                  column.columnName.includes('Date'),
              }"
            >
              <a
                href="#"
                :class="{
                  asc: request.ascending,
                  'table__head--sort': request.sortColumn == column.columnName,
                }"
                @click="sort(column.columnName)"
              >
                {{ column.columnLabel }}
              </a>
            </th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody class="table__body">
          <tr
            v-for="(item, rowIndex) in dataResponse.rows"
            :key="item.items.columnOrder + '-' + rowIndex"
            :style="{
              background: item.data.notificationFlag ? '#ffe6e6' : '',
            }"
          > 
            <td
              class="text--align-left"
              v-for="column of dataResponse.columns"
              :key="column.columnOrder"
              :class="{
                'text--align-right':
                  item.items.find((i) => i.columnName == column.columnName)
                    .type !=null,
              }"
            >
              <span
                v-if="
                  item.items.find((i) => i.columnName == column.columnName)
                    .type == 'percent'
                "
              >
                {{
                  item.items.find((i) => i.columnName == column.columnName)
                    .value | percentDisplay
                }}
              </span>
              <span
                v-else-if="
                  item.items.find((i) => i.columnName == column.columnName)
                    .type == 'dateDisplay'
                "
              >
                {{
                  item.items.find((i) => i.columnName == column.columnName)
                    .value | dateDisplay
                }}
              </span>
              <span
                v-else-if="
                  item.items.find((i) => i.columnName == column.columnName)
                    .type == 'currency'
                "
                :class="{
                  'text--color-red':
                    item.items.find((i) => i.columnName == column.columnName)
                      .value < 0,
                }"
              >
                {{
                  item.items.find((i) => i.columnName == column.columnName)
                    .value | currencyDisplay
                }}
              </span>
              <span v-else>
                {{
                  item.items.find((i) => i.columnName == column.columnName)
                    .value
                }}
              </span>
            </td>
            <td class="pa--left-4 edit-row">              
              <EditDropDown :item="item" @editAccount="editAccount" />
            </td>
             <td>
              <app-help
                :data="item.data.notificationMessage"
                v-if="item.data.notificationFlag"
              />
            </td>
          </tr>
          <tr v-if="!response.pageInfo.totalResults && !request._loading">
            <td colspan="8" class="text--align-center">
              <div class="table__body--empty">
                <span>Sorry, no fees were found for review.</span>
                <img
                  src="../../assets/no-data.png"
                  alt="No Data"
                  width="150px"
                />
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot
          class="table__foot"
          v-if="
            request.page < response.pageInfo.totalPages && review.length != 0
          "
        >
          <tr class="table__foot--load">
            <td colspan="100%" @click="paginate()">Load More</td>
          </tr>
        </tfoot>
      </table>
    </div>    
    <edit-fee
      v-if="toggleEdit"
      :dialogWidth="dialogWidth"
      :selectedOption="selectedOption"
      :item="editItem.data"        
      @onClose="onClose()"
      @onSave="onSave()"
    />
    <save-fee
      v-if="toggleSave"   
      :editRequest="editRequest"           
      @onCancel="onCancel()"
      @onSaveConfirm="onSaveConfirm()"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from "vue-property-decorator";
import {
  DataResponse,
  FilterViewModel,
  FilterItemViewModel,
  ListItem,
  HouseHoldSearchModel,
  IListService,
  FeeRequestModel,
  FeeReportModel,
  DateRangeModel,
  BillingPeriod,
  UserPreferenceModel,
  DataTableModel,
  DataTableRowModel,
  DataTableCellModel,
  SufficientFunds,
  notificationTypeModel,
  ChangesToData
} from "@/model";

import { IApprovalService } from "@/service";
import { BaseComponent } from "@/components";
import FilterComponent from "@/components/controls/FilterComponent.vue";
import AppHelp from "@/components/layout/AppHelp.vue";
import EditDropDown from "../approvals/components/EditDropDown.vue";
import EditFee from "../approvals/components/EditFee.vue";
import SaveFee from "../approvals/components/SaveFee.vue";

@Component({
  components: { FilterComponent,AppHelp, EditDropDown, EditFee,SaveFee },
})
export default class ReviewLanding extends BaseComponent {
  @Inject("approvalService") service: IApprovalService;
  @Inject("householdService")
  householdSearch: IListService<HouseHoldSearchModel>;

  public review: Array<FeeReportModel> = [];
  public response: DataResponse<FeeReportModel> = new DataResponse();
  public request: FeeRequestModel = new FeeRequestModel();
  public dataResponse: DataTableModel = new DataTableModel();
  public allowedStatus:Array<string>=[];

  filterData: FilterViewModel = null;
  public toggleEdit: boolean = false;
  public dialogWidth: string = '';
  public editItem: DataTableRowModel;
  public editRequest: FeeReportModel = new FeeReportModel();
  public selectedOption: string = "";
  public toggleSave: boolean = false;

  mounted() {
    this.allowedStatus= ["AP", "PP", "CO", "RJ"];
    if(this.$store.getters.pendingReview.toLowerCase() == 'true')
    this.allowedStatus.push("PR"); 

    this.filterData = this.getDefaultFilters();
    this.getDetails(this.filterData);
  }

  // @Watch("$route")
  // routeChange() {  
  //   this.$router.go(0);
  // }

  getDefaultFilters() {
    let filterData = new FilterViewModel();
    filterData.title = "fees";
    filterData.width = 1050;
    filterData.items = [];

    let item = new FilterItemViewModel("event", "checkboxlist", "Event", 1);
    item.items = [];

    Object.keys(this.$store.getters.settings.billingEvent).forEach(
      (k: string) => {
        item.items.push(
          new ListItem(this.$store.getters.settings.billingEvent[k], k)
        );
      }
    );

    filterData.items.push(item);

    item = new FilterItemViewModel("feeAmount", "amountrange", "Fee Amount", 1);
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "feeAmountVariance",
      "amountrange",
      "Fee Amount Variance",
      1
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "custodianCode",
      "checkboxlist",
      "Custodian",
      1
    );
    item.items = Object.entries(this.$store.getters.custodian).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("manager", "checkboxlist", "Manager", 1);
    item.items = Object.entries(this.$store.getters.manager).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("program", "checkboxlist", "Program", 1);
    item.items = Object.entries(this.$store.getters.program).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("household", "autocomplete", "Household", 1);
    let householdRequest = new HouseHoldSearchModel();
    householdRequest.type = "Household";
    item.request = householdRequest;
    item.service = this.householdSearch;
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "sufficientFunds",
      "radiolist",
      "Sufficient Funds",
      1
    );
    item.items = [];
    for (var d in SufficientFunds) {
      item.items.push(
        new ListItem(d, SufficientFunds[d as keyof typeof SufficientFunds])
      );
    }
    filterData.items.push(item);

    item = new FilterItemViewModel("status", "checkboxlist", "Status", 1);
    let status = this.$route.query.status
      ? this.$route.query.status.toString().split(",")
      : [];
    item.items = [];
    Object.entries(this.$store.getters.status).forEach((e) => {
      let listItem = new ListItem(e[0], e[1].toString());

      if (status.includes(listItem.value)) listItem.selected = true;

      if (this.allowedStatus.includes(listItem.value))
        item.items.push(listItem);
    });
    filterData.items.push(item);

    item = new FilterItemViewModel("periods", "checkboxlist", "Period", 2);
    item.items = [];
    this.$store.getters.periods.forEach((e: BillingPeriod) => {
      let listItem = new ListItem(e.name, e.name);

      if (
        this.$route.query.period &&
        listItem.value == this.$route.query.period
      )
        listItem.selected = true;

      item.items.push(listItem);
    });
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "annualizedFee",
      "amountrange",
      "Annualized Fee Rate",
      2
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("feeAum", "amountrange", "Billable AUM", 2);
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "feeAumVariance",
      "amountrange",
      "Fee AUM Variance",
      2
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "advisorCode",
      "autocomplete",
      "Rep Code",
      2
    );
    let selectedAdvisors = this.$store.getters.selectedAdvisor;
    if (selectedAdvisors)
      item.items = selectedAdvisors
        .split(",")
        .map((s: string) => new ListItem(s, s));
    else
      item.items = Object.entries(this.$store.getters.advisors.sort()).map(
        (e) => new ListItem(e[1].toString(), e[0])
      );

    filterData.items.push(item);

    item = new FilterItemViewModel("style", "autocomplete", "Style", 2);
    item.items = Object.entries(this.$store.getters.style).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("product", "checkboxlist", "Product", 2);
    item.items = Object.entries(this.$store.getters.product).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("accounts", "autocomplete", "Accounts", 2);
    let request = new HouseHoldSearchModel();
    request.type = "Account";
    item.request = request;
    item.service = this.householdSearch;
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "changesToData",
      "checkboxlist",
      "Changes to Data",
      2
    );
    item.items = [];
    for (var c in ChangesToData) {
      item.items.push(
        new ListItem(c, ChangesToData[c as keyof typeof ChangesToData])
      );
    }
    filterData.items.push(item);

    return filterData;
  }

  private paginate() {
    this.request.page += 1;
    this.getDetails(this.filterData);
  }

  private sort(column: string) {
    this.request.ascending = !this.request.ascending;
    this.request.sortColumn = column;

    this.request.page = 1;
    this.getDetails(this.filterData);
  }

  public getDetails(filterData: FilterViewModel) {
    this.request.firmCode = this.$store.getters.selectedFirm;
    this.request.sorts = undefined;
    if (!this.request.sortColumn) {
      this.request.sorts = [];
      this.request.sorts.push({ sortColumn: "eventDate", ascending: false });
      this.request.sorts.push({ sortColumn: "accountNumber", ascending: true });
    }

    if (this.filterData) {
      let item = filterData.items.find((i) => i.id == "event");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.billingEvent = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "feeAmount");
      if (item)
        this.request.feeAmount =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;

      item = filterData.items.find((i) => i.id == "feeAmountVariance");
      if (item && item.data && item.data.amount > 0) {
        if (item.data.operator == "><")
          this.request.feeAmountVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: -item.data.amount,
          };
        else
          this.request.feeAmountVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: null,
          };
      }else {
        this.request.feeAmountVariance = null;
      }

      item = filterData.items.find((i) => i.id == "custodianCode");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.custodianCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "manager");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.managerCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "program");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.program = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "household");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.householdId = item.selectedItems.map((i) =>
          parseInt(i.value)
        );

      item = filterData.items.find((i) => i.id == "sufficientFunds");
      if (item && item.selectedItems && item.selectedItems.length)
        item.selectedItems.forEach((i) => {          
           if (i.text == "Yes") this.request.isSufficientFund = true;
          else this.request.isSufficientFund = false;  
        });

      item = filterData.items.find((i) => i.id == "changesToData");
      if (item && item.selectedItems && item.selectedItems.length)
        item.selectedItems.forEach((i) => {
          let notificationType = new notificationTypeModel();
          notificationType.comparator = "Equals";
          notificationType.value = i.value;
          this.request.notificationType.push(notificationType);
        });
        else this.request.notificationType=null;

      item = filterData.items.find((i) => i.id == "status");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.status = item.selectedItems.map((i) => i.value);
      else this.request.status = this.allowedStatus;

      item = filterData.items.find((i) => i.id == "periods");
      if (item && item.selectedItems && item.selectedItems.length) {
        item.selectedItems.forEach((i) => {
          let item: BillingPeriod = this.$store.getters.periods.find(
            (p: BillingPeriod) => p.name == i.text
          );
          if (item) {
            this.request.feeReportStartDate = new DateRangeModel(
              ">=",
              item.startDate
            );
            this.request.feeReportEndDate = new DateRangeModel(
              "<=",
              item.endDate
            );
          }
        });
      }

      item = filterData.items.find((i) => i.id == "annualizedFee");
      if (item)
        this.request.annualRate =
          item.data && item.data.amount > 0
            ? {
                range: item.data.operator,
                value: +(item.data.amount * 100).toFixed(4),
              }
            : null;

      item = filterData.items.find((i) => i.id == "feeAum");
      if (item)
        this.request.feeAum =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;

      item = filterData.items.find((i) => i.id == "feeAumVariance");
      if (item && item.data && item.data.amount > 0) {
        if (item.data.operator == "><")
          this.request.feeAumVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: -item.data.amount,
          };
        else
          this.request.feeAumVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: null,
          };
      }else {
        this.request.feeAumVariance = null;
      }

      item = filterData.items.find((i) => i.id == "advisorCode");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.advisorCode = item.selectedItems.map((i) => i.text);

      item = filterData.items.find((i) => i.id == "style");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.styleCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "product");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.product = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "accounts");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.accountId = item.selectedItems.map((i) =>
          parseInt(i.value)
        );
    }

    this.request._loading = true;
    this.service.getItems(this.request).then((response) => {
      this.response = response;

      if (this.request.page == 1) this.review = [];
      this.review = this.review.concat(this.response.data);

      this.dataResponse.columns = [];
      this.dataResponse.rows = [];

      this.review.forEach((a: any) => {
        let r = new DataTableRowModel();
         r.data = this.$vuehelper.clone(a);
          if(r.data.notificationFlag && r.data.notificationMessage)
        {
          let message=`<ul>`;         
          for(let i=0;i<r.data.notificationMessage.length;i++)          
          message=message+`<li>`+r.data.notificationMessage[i]+`</li>`;          
          message=message+`</ul>`;
          r.data.notificationMessage=message;      
        }
        r.items = [];
        this.userPrefrence.forEach((b: any) => {
          let c = new DataTableCellModel();
          c.columnLabel = b.columnLabel;
          c.columnName = b.columnName;
          c.columnOrder = b.columnOrder;
          if (c.columnName == "notificationMessage" && a[b.columnName]) {
              c.value = "";
              for (let i = 0; i < a[b.columnName].length; i++)
                c.value = c.value + a[b.columnName][i] + ", ";
              c.value = c.value.substring(0, c.value.length - 2);
            } else 
          c.value = a[b.columnName];
          if (
            c.columnName == "feeReportAmount" ||
            c.columnName == "marketValue" ||
            c.columnName == "totalAUM" ||
            c.columnName == "cashAvailable" ||
            c.columnName == "priorFeeAmount" ||
            c.columnName == "priorFeeMarketValue"
          )
            c.type = "currency";
            else if(c.columnName.includes('Date'))
            c.type = "dateDisplay";
          else if (c.columnName == "annualRate") c.type = "percent";
          else c.type = null;
          r.items.push(c);
        });
        this.dataResponse.rows.push(r);
      });

      this.userPrefrence.forEach((a: any) => {
        this.dataResponse.columns.push({
          columnName: a.columnName,
          columnLabel: a.columnLabel,
          columnOrder: a.columnOrder,
        });
      });

      this.request._loading = false;
    },
      (error) => {
        this.alert(
          `Error! Something went wrong. Please contact administrator.`,
          "Error",
          "error"
        );
      });
  }

  public onApplyFilters(value: FilterViewModel) {
    if(value==null && this.$route.query){      
      const query = Object.assign({}, this.$route.query);
      delete query.status;
      delete query.period;
      this.$router.replace({ query });
      delete this.$route.query.status;
      delete this.$route.query.period;
    }
    else if(value && this.$route.query){      
      let item = value.items.find((i) => i.id == "status"); 
      if (item && !item.items.find((s:any)=>s.selected)){
        const query = Object.assign({}, this.$route.query);
        delete query.status;        
        this.$router.replace({ query });
        delete this.$route.query.status;             
      }      
     item = value.items.find((i) => i.id == "periods");
      if (item && !item.items.find((s:any)=>s.selected)) {
        const query = Object.assign({}, this.$route.query);
        delete query.period;        
        this.$router.replace({ query });
        delete this.$route.query.period;        
      }      
    }  

    this.filterData = value
      ? this.$vuehelper.clone(value)
      : this.getDefaultFilters();

    this.request = new FeeRequestModel();
    this.request.page = 1;
    this.getDetails(this.filterData);
  }

  public editAccount(item: DataTableRowModel, selectedOption: string) {
    this.selectedOption = selectedOption;
    this.editItem = item;
    if (selectedOption == "Adjust Fee") this.dialogWidth = '50%';
    else this.dialogWidth ='33%';
    this.toggleEdit = true;
  }

  public onClose() {
    this.toggleEdit = false;
  }

  public onSave(editRequest: FeeReportModel) {
    this.editRequest=editRequest;
    this.toggleEdit=false;   
    if(this.selectedOption=='Edit Account')
    this.toggleSave = true;   
  }

  public onCancel(){
    this.toggleSave=false;
  }

  public onSaveConfirm(){
    // this.householdService.accountChanges(this.request).then(
    //   (response) => {
    //     this.$emit("onSave");
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
  
  get userPrefrence(): Array<UserPreferenceModel> {
    return this.$store.getters.userPreferences.find(
      (a: any) => a.pageName == "Review Billing"
    ).columns;
  }
}
</script> 
