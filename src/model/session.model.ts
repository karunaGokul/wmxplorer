import { AccountFilterModel } from './household.model';
import { UserModel } from './user.model';

export class SessionState {
    filters: AccountFilterModel;

    pendingApproveCount: number;
    rejectedCount:number;
    dismissPendingApprove: boolean;
    dismissRejected:boolean;

    user: UserModel;
    logo: string;
}