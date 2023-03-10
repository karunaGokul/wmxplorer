export class SettingsModel {
    public apiUrl: string;
    public apiPath: string;

    public wmeApiUrl: string;
    public wmeApiPath: string;

    public keycloakUrl: string;
    public keycloakClientId: string;
    public keycloakRealm: string;
    
    public gridPageSize: number;

    public logo: string;
    public styles: any;
    public help: any;

    public legalContent: string;
    public billingEvent: any;
    public paymentAccountsPage:boolean;
}

export class SettingsState {
    public settings: SettingsModel;
}

export class GlobalConfigurationModel {
    enableFeeStatusPendingReview: string;
    defaultProductName:string;
    defaultProgramName:string;
    defaultSecutriyIdentifier:string;
    useFirmCodeForProgram:string;
}

export class resoureLoaderState {
    globalConfiguration:GlobalConfigurationModel = new GlobalConfigurationModel();
    localizedResources:LocalizedResourceModel = new LocalizedResourceModel();
    pageColumnConfiguration:any;
}

export class LocalizedResourceModel {
    BillingEvent: BillingEventModel=new BillingEventModel();
    FeeAdjReasonComment:FeeAdjReasonCommentModel=new FeeAdjReasonCommentModel();
    Fee:FeeModel=new FeeModel();    
}

export class BillingEventModel {
    BillingEvent: string;
    Deposit: string;
    Inception: string;
    MSChange: string;
    ManualFee: string;
    OnCycle: string;
    PPChange: string;
    RepChange: string;
    SleeveChange: string;
    Termination: string;
    Withdrawal: string;
}

export class FeeAdjReasonCommentModel {
    REASON01:  string;
    REASON02:  string;
    REASON03:  string;
    REASON04:  string;   
}

export class FeeModel {
    billToAccount_confirmMessage:  string;      
}