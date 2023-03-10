import { BaseModel, DataRequest } from './base.model';

export class FeeReportModel extends BaseModel {
    feeId: number;
    accountName: string;
    accountNumber: string;
    annualRate: number;
    program: string;
    billingEvent: string;
    householdNumber: string;
    householdName: string;
    custodianCode: string;
    advisorCode: string;
    advisorName: string;
    managerCode: string;
    styleCode: string;
    programDescription: string;
    product: string;
    feeReportAmount: number;
    marketValue: number;
    totalAUM: number;
    billingPeriodName: string;
    accountClassification: string;
    cashAvailable: number;
    priorFeeAmount: number;
    priorFeeMarketValue: number;
    externalAccountId: string;
    paymentMethod: string;
    paymentInformation: string;
    manualFlag: boolean;
    firmCode: string;
    billingMethod: string;
    billingFrequency: string;
    externalFeeId: string;
    originalFeeId: string;
    feeScheduleCode: string;
    feeScheduleDescription: string;
    billingStartDate: string;
    eventDate: string;
    feeStartDate: string;
    feeEndDate: string;
    feeReportDate: string;
    feeExportDate: string;
    status: string;
    accountExecutionId?:number;
    accountIdentifier?: string;
    accountKey?: string;
    adjustmentFee?: boolean;
    basisType?: string;
    batchId?: string;
    billToAccount?: string;
    custodianName?: string;
    depositFee?: boolean;
    exclusionAmount?: number;
    fee?: number;
    feeBasisDate?: string;
    inceptionFee?: boolean;
    invoiceGroupDescription?: string;
    invoiceGroupName?: string;
    lostFee?: boolean;
    managerName?: string;
    newFee?: boolean;
    noOfDaysBilled?: number;
    notificationFlag?: boolean;
    notificationMessage?: string;
    onCycleFee?: boolean;
    paymentInstitution?: string;
    processType?: string;
    termFee?: boolean;
    totalAssets?: number;
    withdrawalFee?: boolean;
    billingEventId?: number;
}

export class FeeRequestModel extends DataRequest {
    accountId: Array<number>;
    advisorCode: Array<string>;
    annualRate: FeeRangeModel = new FeeRangeModel();
    billingEvent: Array<string>;
    custodianCode: Array<string>;
    feeAmount: FeeRangeModel = new FeeRangeModel();
    firmCode: string;
    householdId: Array<number> = [];
    managerCode: Array<string>;
    product: Array<string>;
    program: Array<string>;
    status: Array<string>;
    styleCode: Array<string>;
    feeTypeCode: string = "IF";
    feeReportStartDate: DateRangeModel;
    feeReportEndDate: DateRangeModel;
    notificationType: Array<notificationTypeModel>=[];
    isSufficientFund:boolean;
    feeAmountVariance: FeeRangeModel = new FeeRangeModel();
    feeAumVariance: FeeRangeModel = new FeeRangeModel();
    feeAum: FeeRangeModel = new FeeRangeModel();
}

export class FeeRangeModel {
    range: string;
    value: number;
    lowerBoundValue?:number;
}

export class notificationTypeModel {
    comparator: string;
    value: string;   
}

export class DateRangeModel {
    constructor(public comparator: string, public date: Date) { }
}
export class ExportRequestModel {
    pageName: string;
    allColumns: boolean;
    requestDTO: FeeRequestModel = new FeeRequestModel();
}

export class NotificationCountModel {
    pendingApproveCount: number;
    rejectedCount: number;    
}
