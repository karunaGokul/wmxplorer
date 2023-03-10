import { GetterTree, MutationTree, ActionTree } from 'vuex';

import { navigationState } from '@/model';

const state: navigationState = {
    isManualFlagUpdate: false,
    routePath:null
}

const getters: GetterTree<navigationState, any> = {
    isManualFlagUpdate: state => {
        return state.isManualFlagUpdate;
    },
    isRouteUpdate: state => {
        return state.routePath;
    }    
}

const mutations: MutationTree<navigationState> = {
    onUpdateManualFlag(state,data) {       
        state.isManualFlagUpdate = data;       
    },
    onUpdateRoute(state,data) {       
        state.routePath = data;       
    }
}

const actions: ActionTree<navigationState, any> = {    
    updateManualFlag(context,data) {
        context.commit("onUpdateManualFlag",data);             
    },
    updateRoute(context,data) {
        context.commit("onUpdateRoute",data);             
    }
}

export const NavigationModule = {
    state,
    getters,
    mutations,
    actions
}