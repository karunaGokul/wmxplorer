import { IBaseService, BaseService } from './base.service';
import { DataResponse, FeeReportModel, FeeRequestModel,NotificationCountModel } from '@/model';

export interface IApprovalService extends IBaseService<FeeRequestModel, FeeReportModel> {
    approve(data: Array<FeeReportModel>): Promise<Array<FeeReportModel>>;
    getPendingCount(): Promise<NotificationCountModel>;
}
export class ApprovalService extends BaseService<FeeRequestModel, FeeReportModel> implements IApprovalService {
    constructor() {
        super('approval', FeeReportModel)
    }

    getItems(request: FeeRequestModel): Promise<DataResponse<FeeReportModel>> {
        return this.searchPost(request, `list`)
    }

    approve(data: Array<FeeReportModel>): Promise<Array<FeeReportModel>> {
        return this.httpPost(this.path, data).then(response => {
            return response.data;
        });
    }

    getPendingCount(): Promise<NotificationCountModel> {
        return this.httpGet(`${this.path}/count`, null, null).then(response => {
            return response.data;
        });
    }
}