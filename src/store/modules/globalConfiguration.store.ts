import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { resoureLoaderState } from '@/model';
import { ConfigurationService } from '@/service';

const state: resoureLoaderState = {
    globalConfiguration: null,
    localizedResources:null,
    pageColumnConfiguration:null

}
const getters: GetterTree<resoureLoaderState, any> = {
    pendingReview: state => {
        return state.globalConfiguration.enableFeeStatusPendingReview;
    },
    billToAccountConfirmMessage: state => {
        return state.localizedResources.Fee.billToAccount_confirmMessage;
    }
}
const mutations: MutationTree<resoureLoaderState> = {
    onLoadGlobalConfiguration(state, data) {      
            state.globalConfiguration = data.globalConfiguration;
            state.localizedResources = data.localizedResources;                    
    }
}
const actions: ActionTree<resoureLoaderState, any> = {
    loadGlobalConfiguration(context) {
        if (context.state.globalConfiguration && context.state.localizedResources) {            
            return new Promise((resolve, reject) => {
                context.commit("onLoadGlobalConfiguration", context.state);
                resolve(context.state);
            });
        }
        else {  
            let service = new ConfigurationService();
            return service.getGlobalConfiguration().then(response => {
                context.commit("onLoadGlobalConfiguration", response);
            });          
           
        }
    }   
}

export const globalConfigurationModule = {
    state,
    getters,
    mutations,
    actions
}