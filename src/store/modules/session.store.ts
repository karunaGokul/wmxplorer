import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { ApprovalService, HouseHoldService, UserService } from '@/service';
import { AccountFilterModel, ChangeUserNameRequest, SessionState } from '@/model';

const state: SessionState = {
    filters: null,
    pendingApproveCount: parseInt(sessionStorage.getItem("wmx-pendingApprove-count")) || null,    
    rejectedCount:parseInt(sessionStorage.getItem("wmx-rejected-count")) || null,
    dismissPendingApprove: sessionStorage.getItem("wmx-pendingApprove-dismiss") == "true" ? true : false,
    dismissRejected: sessionStorage.getItem("wmx-rejected-dismiss") == "true" ? true : false,
    user: null,
    logo: sessionStorage.getItem("wmx-logo") || null
}

const getters: GetterTree<SessionState, any> = {
    billingMethod: state => {
        return state.filters ? state.filters.billingMethod : {};
    },
    billingFrequency: state => {
        return state.filters ? state.filters.billingFrequency : {};
    },
    custodian: state => {
        return state.filters ? state.filters.custodian : {};
    },
    manager: state => {
        return state.filters ? state.filters.manager : {};
    },
    product: state => {
        return state.filters ? state.filters.product : {};
    },
    program: state => {
        return state.filters ? state.filters.program : {};
    },
    style: state => {
        return state.filters ? state.filters.style : {};
    },
    valuationMethod: state => {
        return state.filters ? state.filters.valuationMethod : {};
    },
    periods: state => {
        return state.filters? state.filters.periods: [];
    },
    status: state => {
        return state.filters? state.filters.status: {};
    },
    pendingApproveCount: number => {
        return state.pendingApproveCount;
    },
    rejectedCount: number => {
        return state.rejectedCount;
    },
    showPendingApproveBar: boolean => {
        return state.pendingApproveCount > 0 && !state.dismissPendingApprove;
    },
    showRejectedBar: boolean => {
        return state.rejectedCount > 0 && !state.dismissRejected;
    },
    userName: string => {
        return state.user?.nickName || state.user?.userName;
    },
    userAvatar: string => {
        return state.user?.avatar;
    },
    logo: string => {
        return state.logo;
    }
}
const mutations: MutationTree<SessionState> = {
    onLoadFilters(state, response) {
        state.filters = response;

        sessionStorage.setItem("wmx-default-filters", JSON.stringify(response));
    },
    onLoadNotification(state, data) {
        state.pendingApproveCount = data.pendingApproveCount;
        state.rejectedCount = data.rejectedCount;

        sessionStorage.setItem("wmx-pendingApprove-count", data.pendingApproveCount.toString());
        sessionStorage.setItem("wmx-rejected-count", data.rejectedCount.toString());
    },
    onDismissPendingApprove(state) {
        state.dismissPendingApprove= true;

        sessionStorage.setItem("wmx-pendingApprove-dismiss", "true");
    },
    onDismissRejected(state) {
        state.dismissRejected= true;

        sessionStorage.setItem("wmx-rejected-dismiss", "true");
    },
    onLoadUser(state, user) {
        state.user = user;

        sessionStorage.setItem("wmx-user", JSON.stringify(user));
    },
    onLoadLogo(state, logo) {
        state.logo = logo;

        sessionStorage.setItem("wmx-logo", logo);
    }
}
const actions: ActionTree<SessionState, any> = {
    checkSession(context) {
        if (!context.state.filters) {
            let cache = sessionStorage.getItem("wmx-default-filters");
            if (cache) {
                context.commit("onLoadFilters", JSON.parse(cache));
            }
            else {
                context.dispatch("loadFilters");
            }
        }

        if (context.state.pendingApproveCount == null||context.state.rejectedCount == null)
            context.dispatch("loadNotification");

        if (!context.state.user) {
            let cache = sessionStorage.getItem("wmx-user");
            if (cache) {
                context.commit("onLoadUser", JSON.parse(cache));
            }
            else {
                context.dispatch("loadUser");
            }
        }

        if (context.state.logo == null)
            context.dispatch("loadLogo", context.getters.selectedFirm);
    },

    loadFilters(context) {
        let service = new HouseHoldService();

        service.getFilters().then(response => {
            context.commit("onLoadFilters", response);
        });
    },
    loadNotification(context) {
        let service = new ApprovalService();

        service.getPendingCount().then((response) => {
            context.commit("onLoadNotification", response);
        });
    },
    loadUser(context) {
        let service = new UserService();

        service.getItem(undefined).then((user) => {
            context.commit("onLoadUser", user);
        });
    },
    loadLogo(context, firmCode) {
        let service = new UserService();

        service.getLogo(firmCode).then((logo) => {
            context.commit("onLoadLogo", logo);
        });
    },
    updateUserName(context, userName) {
        let service = new UserService();
        const request = new ChangeUserNameRequest();
        request.nickName = userName;
        service.changeUserName(request).then((response) => {
            let user = context.state.user;
            user.nickName = response.nickName;

            context.commit("onLoadUser", user);
        });
    },

    updateUserAvatar(context, file) {
        let service = new UserService();
        service.uploadAvatar(file).then((response) => {
            let user = context.state.user;
            user.avatar = response.avatar;

            context.commit("onLoadUser", user);
        });
    },

    dismissPendingApprove(context) {
        context.commit("onDismissPendingApprove");
    },
    dismissRejected(context) {
        context.commit("onDismissRejected");
    },

    clearSession(context) {
        context.state.filters = null;
        context.state.pendingApproveCount = null;
        context.state.rejectedCount = null;
        context.state.user = null;

        sessionStorage.removeItem("wmx-default-filters");
        sessionStorage.removeItem("wmx-pendingApprove-count");
        sessionStorage.removeItem("wmx-rejected-count");
        sessionStorage.removeItem("wmx-pendingApprove-dismiss");
        sessionStorage.removeItem("wmx-rejected-dismiss");
        sessionStorage.removeItem("wmx-user");
        sessionStorage.removeItem("wmx-logo");

        sessionStorage.removeItem("wmx-upload-billing");
        sessionStorage.removeItem("wmx-upload-billing-file-info-accounts");
        sessionStorage.removeItem("wmx-upload-billing-file-info-assets");
    }
}

export const SessionModule = {
    state,
    getters,
    mutations,
    actions
};