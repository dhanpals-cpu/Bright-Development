import Vue from 'vue';
import Vuex from 'vuex';
import envStore from '@/components/common/models/enviromentalStore';
import carStore from '@/components/common/models/carStore';
import flightStore from '@/components/common/models/flightStore';
import authStore from '@/components/common/models/authStore';
import tripStore from '@/components/common/models/tripStore';
import cartStore from '@/components/common/models/cartStore';
import customerStore from '@/components/common/models/customerStore';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        envStore,
        carStore,
        flightStore,
        authStore,
        tripStore,
        cartStore,
        customerStore
    },
    plugins: [createPersistedState()]
});
