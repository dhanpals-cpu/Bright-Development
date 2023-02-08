import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store.js';
import { evBus } from '@/services/bus.js';

Vue.use(Router);

var url=window.location.href;
var lastItem=url.substring(url.lastIndexOf('/') + 1);


const router = new Router({
    mode: 'history',
    linkActiveClass: 'active',
    linkExactActiveClass: 'exact-active active',
    base: process.env.BASE_URL,
    auth:'',

    routes: [
        // Autheticated Only
        {
            path: '/',
            name: 'HOME',
            slug: 'fb',
            component: () => import('./views/backend/Backend.vue'),
            meta: { authRequired: true },
            external: true
        },
        {
            path: '/cars',
            name: 'My CARS',
            slug: 'mute',
            
            component: () => import('./views/front/Cars.vue'),
            beforeEnter: (to, from, next) => {
    
                if(Object.keys(to.query).length == 0){
                    if (!store.state.authStore.isAuthenticated) {
                        evBus.$emit('guestLayout');
                        next({ path: '/sign-in' });
                    } else {
                        evBus.$emit('frontLayout');
                        next();
                    }
                } else {
                    evBus.$emit('frontLayout');
                   next();
                }
              },
            external: true
        },

        {
            path: '/no-auth',
            name: 'No auth',
            slug: 'c',
            component: () => import('./views/front/noauth.vue'),
            meta: { authRequired: false },
            external: true
        },

        {
            path: '/flights',
            name: 'My FLIGHTS',
            slug: 'mute',
            component: () => import('./views/front/Flights.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/hotels',
            name: 'My HOTELS',
            slug: 'mute',
            component: () => import('./views/front/Hotels.vue'),
            meta: { authRequired: true },
            external: false
        },
        // f
        {
            path: '/cruise',
            name: 'CRUISE',
            slug: 'mute',
            component: () => import('./views/front/Cruise.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/activity',
            name: 'ACTIVITIES',
            slug: 'mute',
            component: () => import('./views/front/Activity.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/vacation',
            name: 'My RENTALS',
            slug: 'mute',
            component: () => import('./views/front/Vacation.vue'),
            meta: { authRequired: true },
            external: false
        },
        { 
            path: '/backoffice/cars', 
            name: 'CARS', 
            slug: 'f', 
            component: () => import('./views/backend/Cars.vue'), 
            meta: { authRequired: true },
            external: false 
        },
        { 
            path: '/backoffice/flights', 
            name: 'FLIGHTS', 
            slug: 'f', 
            component: () => import('./views/backend/Flights.vue'), 
            meta: { authRequired: true },
            external: true 
        },
        { 
            path: '/backoffice/hotels', 
            name: 'HOTELS', 
            slug: 'f', 
            component: () => import('./views/backend/Hotels.vue'), 
            meta: { authRequired: true },
            external: true
        },
        { 
            path: '/backoffice/rentals', 
            name: 'RENTALS', 
            slug: 'f', 
            component: () => import('./views/backend/Vacation.vue'), 
            meta: { authRequired: true },
            external: true
        },
        //
        // fb
        {
            path: '/my_trips',
            name: 'MY TRIPS',
            slug: 'mute',
            component: () => import('./views/front/Trips.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/add-traveler',
            name: 'ADD TRAVELER',
            slug: 't',
            component: () => import('./views/front/AddTraveler.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/edit-traveler',
            name: 'EDIT TRAVELER',
            slug: 't',
            component: () => import('./views/front/InviteEditTraveler.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/checkout-one',
            name: 'Checkout Step One',
            slug: 'ck',
            component: () => import('./views/front/CheckoutOne.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/checkout-two',
            name: 'Checkout Step Two',
            slug: 'ck',
            component: () => import('./views/front/CheckoutTwo.vue'),
            meta: { authRequired: true },
            external: false
        },

        // Guests Only
        // { path: '/sign-in', name: 'SIGN IN', slug: 's', component: () => import('./views/SignIn.vue'), meta: { authRequired: false } },

        {
            path: '/sign-in',
            name: 'SIGN IN',
            slug: 's',
            component: () => import('./views/front/CustomerLogin.vue'),
            meta: { authRequired: false },
            external: false
        },
        {
            path: '/forget-password',
            name: 'FORGET PASSWORD',
            slug: 'fp',
            component: () => import('./views/front/ForgetPassword.vue'),
            meta: { authRequired: false },
            external: false
        },
        {
            path: '/change-password',
            name: 'CHANGE PASSWORD',
            slug: 'cp',
            component: () => import('./views/front/ChangePassword.vue'),
            meta: { authRequired: false },
            external: false
        },
        // { path: '/customer-login', name: 'CUSTOMER LOGIN', slug: 'cus', component: () => import('./views/front/CustomerLogin.vue'), meta: { authRequired: false } },
        {
            path: '/customer-register',
            name: 'CUSTOMER REGISTER',
            slug: 'cus',
            component: () => import('./views/front/CustomerRegister.vue'),
            meta: { authRequired: false },
            external: false
        },
        {
            path: '/customer-payment-info',
            name: 'CUSTOMER PAYMENT INFORMATION',
            slug: 'payment',
            component: () => import('./views/front/CustomerPayInfo.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/customer-add-traveler',
            name: 'CUSTOMER ADD TRAVELER',
            slug: 'traveler',
            component: () => import('./views/front/CustomerAddTravel.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/customer-trips',
            name: 'CUSTOMER TRIPS',
            slug: 'trips',
            component: () => import('./views/front/CustomerTrip.vue'),
            meta: { authRequired: true },
            external: false
        },
        {
            path: '/customer-confirm-trip',
            name: 'CONFIRM TRIP',
            slug: 'mute',
            component: () => import('./views/front/CustomerConfirmTrip.vue'),
            meta: { authRequired: true },
            external: false
        },
        // { path: '/invite', name: 'INVITE CUSTOMER', slug: 'cus', component: () => import('./views/front/CustomerInvite.vue'), meta: { authRequired: false } },
        {
            path: '/invite',
            name: 'INVITE PASSENGER',
            slug: 'cus',
            component: () => import('./views/front/PassengerInvite.vue'),
            meta: { authRequired: false },
            external: false
        }
    ]
});

// Any invalid route will redirect to home
// router.redirect({
//   '*': '/'
// });

// Navigation Gaurd
router.beforeEach((to, from, next) => {
      if (to.matched.some(record => record.meta.authRequired)) {

        if (!store.state.authStore.isAuthenticated) {
            evBus.$emit('guestLayout');
            next({ path: '/sign-in' });
        } else {
            if (to.path === '/' || to.path==='/backoffice/rentals' || to.path==='/backoffice/hotels' || to.path==='/backoffice/cars' || to.path==='/backoffice/flights') {
                evBus.$emit('backendLayout');
            } else {
                evBus.$emit('frontLayout');
            }

            next();
        }
    } else {
        if (to.path === '/customer-payment-info') {
            // explicit case need to have front layout on payment info public page

            evBus.$emit('frontLayout');
        } else {
            evBus.$emit('guestLayout');
        }

        next();
    }
});




export default router;
