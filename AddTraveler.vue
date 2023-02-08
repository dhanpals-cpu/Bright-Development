<template>
    <span style="display: block !important">
        <section class="search-results add-travel-sectionTop">
            <v-container>
                <v-row align="center">
                    <!--first form-->
                    <div class="col-md-9 col-sm-7">
                        <div class="search-heading">
                            <h3>Invite to Add / Edit Travelers</h3>
                        </div>
                        <div class="travels-btn-toper">
                            <ul>
                                <li><strong>Travelers:</strong></li>
                                <li>
                                    <v-btn class="primary"
                                        ><i class="fas fa-user-plus"></i> Add
                                        Traveler</v-btn
                                    >
                                </li>
                                <li>
                                    <v-btn
                                        class="primary"
                                        @click="
                                            invitePopUp = true;
                                            inviteMails = [];
                                        "
                                    >
                                        <i
                                            class="fas fa-envelope-open-text"
                                        ></i>
                                        Invite Traveler
                                    </v-btn>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!--first form-->

                    <div
                        class="col-md-3 col-sm-5"
                        v-if="this.$store.state.authStore.userType != 'agent'"
                    >
                        <div
                            class="your-agent-profile listing-right-sidebar mt-0"
                        >
                            <div class="listing-sidebar-head">
                                <h4>Your Agent</h4>
                            </div>
                            <div class="listing-sidebar-body">
                                <div class="sidebar-content">
                                    <div class="agent-content">
                                        <div class="in-outer">
                                            <div class="in-left">
                                                <img
                                                    src="@/assets/images/avatar.png"
                                                    alt=""
                                                />
                                            </div>
                                            <div class="in-right">
                                                <h6 v-if="tripAgent">
                                                    {{
                                                        tripAgent.vcFName
                                                            | capitalize
                                                    }}
                                                    {{
                                                        tripAgent.vcLName
                                                            | capitalize
                                                    }}
                                                </h6>
                                            </div>
                                        </div>
                                        <p v-if="this.$store.getters.hasTrip">
                                            Trip Name:
                                            <span>{{
                                                tripDetail.trip_name
                                                    | capitalize
                                            }}</span>
                                        </p>
                                        <p v-if="!this.$store.getters.hasTrip">
                                            Trip Name: <span>None</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-row>
            </v-container>
        </section>

        <section class="add-travel-section">
            <v-container>
                <v-row class="reversing-here" v-if="!tripDetail.trip_id">
                    <div class="col-lg-9 col-md-12">
                        <v-row class="mt-0 mb-0">
                            <div class="col-md-9 col-sm-9">
                                <h4>Please choose a trip to add travellers</h4>
                            </div>
                        </v-row>
                    </div>
                </v-row>

                <v-row class="reversing-here" v-if="tripDetail.trip_id">
                    <div class="col-lg-9 col-md-12">
                        <v-row class="mt-0 mb-0">
                            <div
                                class="col-md-6 col-sm-6"
                                v-for="(item, index) in travellerList"
                                :key="index"
                            >
                                <div class="add-travel-box-top">
                                    <div class="travel-box-iner">
                                        <h3>
                                            {{
                                                (item.traveller_info.firstName +
                                                    ' ' +
                                                    item.traveller_info
                                                        .lastName)
                                                    | capitalize
                                            }}
                                        </h3>
                                        <p>
                                            {{
                                                item.traveller_info.address
                                                    | capitalize
                                            }}<br />
                                            {{ item.traveller_info.mobile
                                            }}<br />
                                        </p>
                                    </div>
                                    <div class="travel-box-iner">
                                        <h5
                                            v-if="
                                                item.traveller_info
                                                    .isPrimaryTraveler == 1
                                            "
                                        >
                                            Primary
                                        </h5>
                                        <h5>{{ item.details }}</h5>
                                    </div>
                                    <div class="travel-box-button">
                                        <v-btn class="primary"
                                            ><i
                                                class="fas fa-envelope-open-text"
                                            ></i>
                                            Invite To Edit</v-btn
                                        >
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-12">
                                <div class="add-travel-box-top">
                                    <v-form ref="form" class="" lazy-validation>
                                        <div class="travel-box-iner">
                                            <h3>{{ btnLabel }} Traveler</h3>
                                            <div class="add-travel-form">
                                                <v-row class="m-0">
                                                    <div
                                                        class="col-md-4 col-sm-4"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <v-autocomplete
                                                                :hide-no-data="
                                                                    true
                                                                "
                                                                :items="
                                                                    optionsTitle
                                                                "
                                                                item-text="label"
                                                                item-value="value"
                                                                v-model="title"
                                                                placeholder="Select title"
                                                                :rules="
                                                                    TitleRules
                                                                "
                                                                required
                                                                :loading="false"
                                                                return-object
                                                            ></v-autocomplete>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="col-md-4 col-sm-4"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <v-text-field
                                                                label="First Name"
                                                                ref="trvFName"
                                                                placeholder="Enter Your First Name"
                                                                v-model="
                                                                    firstName
                                                                "
                                                                :rules="
                                                                    fNameRules
                                                                "
                                                                v-bind:readonly="
                                                                    propReadOnly
                                                                "
                                                            ></v-text-field>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="col-md-4 col-sm-4"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <v-text-field
                                                                label="Last Name"
                                                                placeholder="Enter Your First Name"
                                                                v-model="
                                                                    lastName
                                                                "
                                                                :rules="
                                                                    lNameRules
                                                                "
                                                                v-bind:readonly="
                                                                    propReadOnly
                                                                "
                                                            ></v-text-field>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="col-md-6 col-sm-6"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <v-text-field
                                                                label="Email"
                                                                placeholder="Enter Your Email"
                                                                v-model="email"
                                                                :rules="
                                                                    emailRules
                                                                "
                                                                v-bind:readonly="
                                                                    propEmailReadOnly
                                                                "
                                                            ></v-text-field>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="col-md-6 col-sm-6"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <v-text-field
                                                                label="Address"
                                                                placeholder="Enter Your Address"
                                                                v-model="
                                                                    address
                                                                "
                                                                :rules="
                                                                    addressRules
                                                                "
                                                                v-bind:readonly="
                                                                    propReadOnly
                                                                "
                                                            ></v-text-field>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="col-md-6 col-sm-6"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <v-text-field
                                                                label="Passport Number"
                                                                placeholder="Enter Your Passport Number"
                                                                v-model="
                                                                    passport
                                                                "
                                                                v-bind:readonly="
                                                                    propReadOnly
                                                                "
                                                            ></v-text-field>
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="col-md-6 col-sm-6"
                                                    >
                                                        <div
                                                            class="add-travel-input"
                                                        >
                                                            <div
                                                                class="add-travel-input"
                                                            >
                                                                <!-- Date Picker Work -->
                                                                <v-menu
                                                                    v-model="
                                                                        menu1
                                                                    "
                                                                    :close-on-content-click="
                                                                        false
                                                                    "
                                                                    :nudge-right="
                                                                        50
                                                                    "
                                                                    transition="scale-transition"
                                                                    min-width="290px"
                                                                >
                                                                    <template
                                                                        v-slot:activator="{
                                                                            on,
                                                                            attrs
                                                                        }"
                                                                    >
                                                                        <v-text-field
                                                                            v-model="
                                                                                compPickDateFormatted
                                                                            "
                                                                            readonly
                                                                            v-bind="
                                                                                attrs
                                                                            "
                                                                            v-on="
                                                                                on
                                                                            "
                                                                            :rules="
                                                                                birthDateRules
                                                                            "
                                                                            :placeholder="
                                                                                dateFormatPlaceHolder
                                                                            "
                                                                            prepend-icon="mdi-calendar"
                                                                        ></v-text-field>
                                                                    </template>
                                                                    <v-date-picker
                                                                        v-model="
                                                                            date1
                                                                        "
                                                                        :max="
                                                                            maxPickStartDate
                                                                        "
                                                                        @input="
                                                                            menu1 = false
                                                                        "
                                                                        no-title
                                                                    ></v-date-picker>
                                                                </v-menu>
                                                                <!-- Date Picker Work -->
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="col-md-6 col-sm-6"
                                                    >
                                                        <div
                                                            class="add-travel-input cellNumber"
                                                        >
                                                            <phone-num-select
                                                                v-model="mobile"
                                                                value="premobileval"
                                                                label="Mobile Number"
                                                            />
                                                        </div>
                                                    </div>
                                                </v-row>
                                            </div>
                                        </div>
                                        <div class="travel-box-button">
                                            <div class="form-checkBox">
                                                <v-btn
                                                    class="primary"
                                                    @click="submitForm"
                                                >
                                                    {{ btnLabel }}
                                                </v-btn>

                                                <v-btn
                                                    class="ma-2"
                                                    color="secondary"
                                                    @click="resetAddForm"
                                                    >RESET</v-btn
                                                >
                                            </div>
                                        </div>
                                    </v-form>
                                </div>
                            </div>

                            <div class="col-md-12">
                                <div class="col-6">
                                    <div class="add-travel-box-top">
                                        <div class="travel-box-iner">
                                            <h3>Payment Info</h3>
                                        </div>
                                        <div class="travel-box-iner">
                                            <h5>
                                                Status:
                                                {{
                                                    paymentMethods.length
                                                        ? 'Added'
                                                        : 'Not Added'
                                                }}
                                            </h5>
                                        </div>
                                        <div class="travel-box-button">
                                            <v-btn
                                                class="primary"
                                                to="/customer-payment-info"
                                            >
                                                <i
                                                    class="fas fa-envelope-open-text"
                                                ></i>
                                                Add Payment Info
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-row>
                    </div>

                    <!--adding trip summary-->
                    <customer-trip-summary />
                </v-row>
            </v-container>
        </section>

        <v-row justify="center">
            <v-dialog v-model="invitePopUp" persistent max-width="850px">
                <v-card>
                    <div class="car-popup-header">
                        <div class="in-left">
                            <ul>
                                <li>Invite Traveler</li>
                            </ul>
                        </div>
                        <div class="in-right">
                            <v-btn icon @click="invitePopUp = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </div>
                    </div>

                    <div class="car-popup-body">
                        <v-form ref="invForm" class="" lazy-validation>
                            <v-card style="width: 100%">
                                <v-card-title>
                                    <v-text-field
                                        v-model="inviteEmailAdress"
                                        label="Traveler Email Address"
                                        :rules="emailRules"
                                        clearable
                                    ></v-text-field>
                                </v-card-title>

                                <v-card-title>
                                    <v-btn
                                        color="primary"
                                        elevation="10"
                                        large
                                        @click="inviteTraveller"
                                    >
                                        Send &nbsp;

                                        <v-icon color=""
                                            >mdi-email-send-outline</v-icon
                                        >
                                    </v-btn>
                                </v-card-title>
                            </v-card>
                        </v-form>
                    </div>
                </v-card>
            </v-dialog>
        </v-row>
    </span>
</template>
<script>
import * as dataKey from '@/services/data/dsources.js';
import travellerServices from '@/services/api/Travellers';
import tripServices from '@/services/api/Trips';
import { evBus } from '@/services/bus.js';
import CustomerTripSummary from '@/components/common/widgets/CustomerTripSummary.vue';
import PhoneNumSelect from '../../common/widgets/PhoneNumSelect.vue';

var moment = require('moment');
export default {
    name: 'AddTraveler',
    components: {
        CustomerTripSummary,
        PhoneNumSelect
    },
    data() {
        return {
            inviteEmailAdress: null,
            mobile: '',
            premobileval: null,
            traveler_id: null,
            trip_id: null,
            propReadOnly: false,
            propEmailReadOnly: false,
            loading: false,
            invitePopUp: false,
            birthMonths: [],
            birthDays: [],
            birthYears: [],
            selBirthMonth: {},
            selBirthYear: parseInt(new Date().getFullYear()) - 1,
            selBirthDay: 1,
            firstName: null,
            lastName: null,
            email: null,
            address: null,
            passport: null,
            ckPrimaryTrv: false,
            search: '',
            btnLabel: 'Add',
            paymentMethods: [],
            title: '',
            optionsTitle: [
                {
                    value: 'Mr',
                    label: 'Mr.'
                },
                {
                    value: 'Ms',
                    label: 'Miss.'
                },
                {
                    value: 'Mrs',
                    label: 'Mrs.'
                },
                {
                    value: 'Miss',
                    label: 'Ms.'
                },
                {
                    value: 'Dr',
                    label: 'Dr.'
                },
                {
                    value: 'Other',
                    label: 'Other.'
                }
            ],
            travellers: [],
            inviteMails: [],
            dateFormatPlaceHolder: this.$store.state.envStore.countryDF,
            date1: null,
            menu1: false,
            maxPickStartDate: this.formattedDate(new Date(), 'YYYY-MM-DD'),
            TitleRules: [v => !!v || 'Title is required'],
            fNameRules: [
                v => !!v || 'First name is required',
                v =>
                    (v && v.length >= 3) ||
                    'First name must have atleast 3 characters'
            ],
            lNameRules: [
                v => !!v || 'Last name is required',
                v =>
                    (v && v.length >= 3) ||
                    'Last name must have atleast 3 characters'
            ],
            phoneRules: [
                v => !!v || 'Mobile Number is required',
                v =>
                    (v && v.length >= 7) ||
                    'Mobile Number must have atleast 7 digits'
            ],
            addressRules: [
                v => !!v || 'Address is required'
                // (v) => ( v && v.length >= 5 ) || "Address must have atleast 5 characters"
            ],
            emailRules: [
                v => !!v || 'Email is required',
                v => /.+@.+/.test(v) || 'Email must be valid'
            ],
            birthDateRules: [v => !!v || 'Birth date is required']
        };
    },
    created: function() {
        let that = this;

        this.trip_id = this.tripDetail.trip_id;

        evBus.$on('addPassenger', () => {
            that.resetAddForm();
            that.$awn.info('Please add passenger information..!', {
                labels: { info: 'Add Passenger' }
            });
            that.$refs.trvFName.$el.focus();
        });

        evBus.$on('loadTravellerInfos', travelerInfo => {
            that.populateAddForm(travelerInfo);
        });
    },
    mounted: function() {
        this.birthMonths = dataKey.months;
        this.selBirthMonth = this.birthMonths[0];
        this.birthDays = dataKey.days;
        this.birthYears = dataKey.years;
        this.travellers = [];
        this.search = '';

        let _invToken = this.$store.getters.inviteToken;
        let _userRole = this.signedUserRole;

        if (_invToken != false && _userRole == 'customer')
            this.loadCustomerDetails();

        if (this.tripDetail.trip_id) {
            let payLoad = {
                searchBy: 'tripId',
                searchKey: this.tripDetail.trip_id
            };

            let reqHeaders = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            };

            let searchTripForm = new FormData();

            this.appendFormdata(searchTripForm, payLoad);

            tripServices
                .searchTrip(searchTripForm, reqHeaders)
                .then(rsp => {
                    if (
                        rsp.data.success == false &&
                        rsp.data.message == 'Token has expired'
                    ) {
                        this.doPopLogout();
                        return true;
                    } else if (
                        rsp.data.success == false &&
                        rsp.data.message != 'Token has expired'
                    ) {
                        this.$awn.info(rsp.data.message);
                    } else {
                        if (rsp.data.data.length > 0)
                            this.displayTripInfo(rsp.data.data[0]);
                    }
                })
                .catch(error => {
                    this.$awn.alert(
                        'Please try later, server encounter error..!'
                    );
                    this.doClosePop();
                    console.log('Error In Trip Save Api', error);
                });
        }
    },
    computed: {
        compPickDateFormatted: {
            // getter
            get: function() {
                return this.formattedDate(
                    this.date1,
                    this.dateFormatPlaceHolder
                );
            },

            // setter
            set: function() {}
        },
        travellerList() {
            return this.doCleanArray(
                this.$store.getters.tripSummary.trip_travellers
            );
        },
        tripCreatorEmail() {
            return this.$store.getters.tripSummary.trip_creator.vcEmail;
        },
        tripAgent() {
            return this.$store.getters.tripSummary.trip_agent;
        },
        signedUserDetails() {
            return this.$store.getters.signedUserDetails;
        }
    },
    methods: {
        loadCustomerDetails() {
            // GRAB STORED DATA

            let userDetails = this.doCleanArray(this.signedUserDetails);
            let _customerInfo = userDetails[0].customer;
            this.paymentMethods = userDetails[0].paymentMethods;
            let _tripInfo = userDetails[0].tripInvitation.tripDetails;

            // dispatch customer informations
            this.$store.dispatch('addCustomer', { CUSTOMER: _customerInfo });

            if (_tripInfo.length > 0) this.displayTripInfo(_tripInfo[0]);
        },

        displayTripInfo(tripDetails) {
            let storePayload = {
                name: tripDetails.tripName,
                trv_name: tripDetails.pTraveler,
                trip_id: tripDetails.tripId,
                tripStartDate: tripDetails.tripStartDate.substr(0, 10)
            };

            this.$store.dispatch('setTripDetail', { TRIP: storePayload });

            this.setUpTripDetails(tripDetails);
        },

        inviteTraveller() {
            if (this.$refs.invForm.validate()) {
                let reqHeaders = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };

                var reqDataForm = new FormData();
                reqDataForm.append('email', this.inviteEmailAdress);
                reqDataForm.append(
                    'tripId',
                    this.$store.state.tripStore.tripID
                );

                travellerServices
                    .inviteTraveller(reqDataForm, reqHeaders)
                    .then(rsp => {
                        if (
                            rsp.data.success == false &&
                            rsp.data.message == 'Token has expired'
                        ) {
                            this.doPopLogout();
                            return true;
                        } else {
                            this.resetInvPops();

                            this.$awn.success(
                                'Invitation thas sent to the traveler successfully..!',
                                {
                                    labels: { success: 'Invitation Sent..!' }
                                }
                            );
                        }
                    })
                    .catch(error => {
                        this.$awn.alert(
                            'Please try later, server encounter error..!'
                        );
                        console.log('Error In Traveller Invite Api', error);
                    })
                    .finally(() => {});
            } // IF FORM VALIDATES
        },
        resetInvPops() {
            this.inviteEmailAdress = null;
            this.$refs.invForm.reset();
            this.invitePopUp = false;
        },

        formattedDate: function(reqDate, reqFormat) {
            if (!reqDate) return null;

            reqDate = moment(reqDate).format(reqFormat);

            return reqDate;
        },
        makeActionAbles: function(arrOfObj) {
            let result = arrOfObj.map(function(el, index) {
                var o = Object.assign({}, el);
                o.srIndex = index + 1;
                o.action = '';
                return o;
            });

            return result;
        },
        populateAddForm: function(travelerInfo) {
            console.log('travelerInfo updated', travelerInfo);

            this.ckPrimaryTrv = false;
            this.traveler_id = travelerInfo.id;
            this.firstName = travelerInfo.firstName;
            this.lastName = travelerInfo.lastName;
            this.email = travelerInfo.email;
            this.address = travelerInfo.address;
            this.mobile = travelerInfo.mobile;
            this.premobileval = travelerInfo.mobile;
            this.passport = travelerInfo.passport;

            if (travelerInfo.isPrimaryTraveler == 1) this.ckPrimaryTrv = true;

            if (travelerInfo.dob != '') {
                this.date1 = travelerInfo.dob; // this.formattedDate(travelerInfo.dob, this.dateFormatPlaceHolder);
            }

            this.propReadOnly = false;
            this.propEmailReadOnly = true;
            this.btnLabel = 'Update';

            evBus.$emit('updatePhoneNumber', travelerInfo.mobile);

            this.$awn.info('Traveller information has loaded in form..!', {
                labels: { info: 'Information Added' }
            });
        },
        resetAddForm: function() {
            this.cdisabled = true;

            this.$refs.form.reset();

            this.cdisabled = false;

            this.propReadOnly = false;
            this.propEmailReadOnly = false;
            this.selBirthMonth = this.birthMonths[0];
            this.selBirthYear = parseInt(new Date().getFullYear()) - 1;
            this.selBirthDay = 1;
            this.traveler_id = null;
            this.date1 = null;
            this.btnLabel = 'Add';
            this.compPickDateFormatted;
            this.ckPrimaryTrv = false;

            // this.selectedCountry = null;
            // this.countryCode = null;
            // this.activeCountry = { iso2: '' };
            // this.selectedIndex
            // this.country = 0;
            // this.country = this.selectedCountry;
        },
        filterTravelers: function(event) {
            var that = this;

            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this.timer = setTimeout(() => {
                let val = event.target.value;

                if (!val) return;

                if (val.length < that.min_search_autocomplete_length) return;

                // Items have already been requested
                if (that.loading) return;

                that.loading = true;
                evBus.$emit('muteVutifyLoader');

                // Lazily load input items
                travellerServices
                    .searchTraveller({
                        searchTraveller: val
                    })
                    .then(response => {
                        if (
                            response.data.success == false &&
                            response.data.message == 'Token has expired'
                        ) {
                            this.doPopLogout();
                            return true;
                        }

                        if (response.data.data.length == 0)
                            this.$awn.info(
                                'No records found against your search..!',
                                {
                                    labels: { info: 'Search Results' }
                                }
                            );

                        that.travellers = that.makeActionAbles(
                            response.data.data
                        );
                    })
                    .catch(error => {
                        this.$awn.alert(
                            'Please try later, server encounter error..!'
                        );
                        console.log('Error In travellers Search Api', error);
                    })
                    .finally(() => {
                        // do some thing here
                        that.loading = false;
                    });
            }, 800); // debounce
        },
        loadData: function() {},
        submitForm: function() {
            if (!this.$refs.form.validate()) return false;

            let _bDay = this.compPickDateFormatted;
            _bDay = moment(_bDay, this.$store.state.envStore.DFormat).unix();
            _bDay = moment(_bDay, 'X').format('YYYY-MM-DD');

            let ageDateChunks = _bDay.split('-');

            let objTrvPayload = {
                title: this.title.value,
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                mobile: this.mobile,
                address: this.address,
                passport: this.passport,
                dob: _bDay,
                age: this.getAge(
                    ageDateChunks[0],
                    ageDateChunks[1],
                    ageDateChunks[2]
                ),
                details: 'Car Driver',
                customerType: 'adult'
            };

            if (this.traveler_id >= 1)
                return this.doUpdateCustomer(objTrvPayload);

            let travellerPayLoad = {
                travellers: [objTrvPayload]
            };

            let reqHeaders = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            };

            var reqDataForm = new FormData();
            reqDataForm.append('data', this.doStrings(travellerPayLoad));
            reqDataForm.append('tripId', this.tripDetail.trip_id);

            travellerServices
                .addTraveller(reqDataForm, reqHeaders)
                .then(rsp => {
                    if (
                        rsp.data.success == false &&
                        rsp.data.message == 'Token has expired'
                    ) {
                        this.doPopLogout();
                        return true;
                    } else {
                        if (objTrvPayload.id === null)
                            objTrvPayload.id = rsp.data;

                        this.setUpTripDetails(rsp.data.data[0]);

                        this.$awn.success(
                            'Traveller has added successfully..!',
                            {
                                labels: { success: 'Traveller Added' }
                            }
                        );

                        this.resetAddForm();
                        this.traveler_id = null;
                    }
                })
                .catch(error => {
                    this.$awn.alert(
                        'Please try later, server encounter error..!'
                    );
                    console.log('Error In Traveller Save Api', error);
                })
                .finally(() => {
                    // do some thing here
                    console.log('Finally function called');
                });
        },
        doUpdateCustomer: function(travelerInfos) {
            let _tripInfo = this.$store.getters.tripSummary;
            let _travellers = _tripInfo.trip_travellers;
            let _travellerDetails = null;
            let _tripStartDate = _tripInfo.trip_from_time;
            let _customerId = null;

            if (_travellers.length)
                _travellers.forEach((item, index) => {
                    if (item.traveller_info.id == travelerInfos.id) {
                        _travellerDetails = item.details;
                        _customerId = item.engineId;
                    }
                }); // Ends FOREACH

            let updatePayload = {
                tripId: _tripInfo.trip_id,
                tripName: _tripInfo.trip_name,
                tripStartDate: _tripStartDate,
                travellerFirstName: travelerInfos.firstName,
                travellerLastName: travelerInfos.lastName,
                travellerEmail: travelerInfos.email,
                travellerPh: travelerInfos.mobile,
                travellerDob: travelerInfos.dob,
                mobile: travelerInfos.mobile,
                details: _travellerDetails,
                customerId: _customerId
            };

            let reqHeaders = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            };

            var reqDataForm = new FormData();

            this.appendFormdata(reqDataForm, updatePayload);

            tripServices
                .updateTrip(reqDataForm, reqHeaders)
                .then(rsp => {
                    if (
                        rsp.data.success == false &&
                        rsp.data.message == 'Token has expired'
                    ) {
                        this.doPopLogout();
                        return true;
                    } else {
                        this.$awn.success(
                            'Traveller has updated successfully..!',
                            {
                                labels: { success: 'Traveller Updated' }
                            }
                        );

                        this.resetAddForm();

                        this.traveler_id = null;
                        this.ckPrimaryTrv = false;
                        this.getTripById(rsp.data.data.tripId);
                    }
                })
                .catch(error => {
                    this.$awn.alert(
                        'Please try later, server encounter error..!'
                    );
                    console.log('Error In Traveller Update Api', error);
                })
                .finally(() => {
                    console.log('Finally function called to update customers');
                });

            return false;
        }
    }
};
</script>
<style scoped></style>
