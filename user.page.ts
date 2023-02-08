import { NGXLogger } from 'ngx-logger';
import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {
  AccountsService,
  FormBuilderService,
  LoadingService,
  PermissionsService,
  PopoverService,
  RolesService,
  TeamsService,
  UserdataService,
  UserService,
  ShiftService,
  SubscriberService,
  FilterElementService,
  Module,
  Permission,
  HierarchyGroupingService
} from '@services';
import { BaseDetailsPage } from '../abstractDetails/abstractBaseDetails.page';
import { DateRangePickerComponent, IPopoverConfig } from '@shared/components';

import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { AlertController , PopoverController } from '@ionic/angular';
import { ManageLocationComponent } from '@shared/components/manage-location/manage-location.component';
@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage extends BaseDetailsPage {

  private locations = this.userService.getUserLocations(this.userdataService.locations, false);

  // private shifts = this.userService.getShiftList(this.userdataService.locations, false, true);
  private shifts = this.shiftByLocations(this.userdataService.locations);

  private supervisors = this.accountService.getSupervisors(this.userdataService.locations);

  private teams = this.teamsByLocation(this.userdataService.locations);

  public title: string = 'MGMT_DETAILS.Add_User';
  public userType: string = 'dedicated';
  public usesSSO: boolean = false;
  public usesLDAP: boolean = false;
  public LDAPServer: number = 0;


  protected newForm: any = {
    id: 'userAddForm',
    cancelButton: 'userAddCancel',
    saveButton: 'userAddSave'
  };

  protected editForm: any = {
    id: 'userEditForm',
    cancelButton: 'userEditCancel',
    saveButton: 'userEditSave',
    deleteButton: 'userEditDelete'
  };

  protected formConfig: any = {
    autocomplete: false,
    canClear: true,
    containers: true,
    prefix: 'userAdd',
    del: null,
    save: this.translate.instant('MGMT_DETAILS.Add_User'),
    cancel: this.translate.instant('SHARED.Cancel'),
    fields: [
      {
        name: 'type',
        title: this.translate.instant('MGMT_DETAILS.User_AccountType'),
        type: 'selectmenu',
        tooltip: this.translate.instant('MGMT_DETAILS.User_tooltip'),
        placeholder: this.translate.instant('MGMT_DETAILS.User_placeholder'),
        multiple: false,
        required: true,
        searchable: false,
        canClear: false,
        class: 'accountType',
        test: (ref) => {
          if (ref.id === 'wristband' || ref.id === 'coordinator') {
            return this.subscriber.usesModule('wristbands');
          } else {
            return true;
          }
        },
        options: [
          {
            id: 'dedicated',
            description: this.translate.instant('SHARED.Dedicated')
          },
          {
            id: 'shared',
            description: this.translate.instant('SHARED.Shared')
          },
          {
            id: 'observation',
            description: this.translate.instant('SHARED.Observation')
          },
          {
            id: 'observer',
            description: this.translate.instant('SHARED.Observer')
          },
          {
            id: 'coordinator',
            description: this.translate.instant('SHARED.Coordinator')
          },
          {
            id: 'wristband',
            description: this.translate.instant('SHARED.WristbandOnly')
          },
          {
            id: 'reporting',
            description: this.translate.instant('SHARED.Reporting')
          },
          {
            id: 'viewer',
            description: this.translate.instant('SHARED.Viewer')
          }
        ],
        onChange: (value: any) => {
          this.updateLocationField(value);
          this.syncGroupsField(value);
          this.hideElementsByClass(value);
        }
      },
      {
        containerClass: 'userField coordinator dedicated shared reporting viewer',
        type: 'flipswitch',
        name: 'usesSSO',
        module: Module.SSO,
        title: this.translate.instant('MGMT_DETAILS.SSO_User'),
        onText:  this.translate.instant('SHARED.Yes'),
        offText:  this.translate.instant('SHARED.No'),
        value: 1,
        default: 0,
        onChange: (val: number) => {
          this.usingSSO(val);
        },
        hideFieldsOnValue: {
          select: [
            {
              hideClasses: ['no-sso-or-ldap'],
              valueFunction: (val) => val === 1 || this.usesLDAP
            },
            {
              hideClasses: ['sso'],
              value: 0
            }
          ]
        }
      },
      {
        containerClass: 'userField coordinator dedicated shared reporting viewer',
        type: 'flipswitch',
        name: 'usesLdap',
        module: Module.LDAP,
        title: this.translate.instant('MGMT_DETAILS.LDAP_User'),
        onText:  this.translate.instant('SHARED.Yes'),
        offText:  this.translate.instant('SHARED.No'),
        value: 1,
        onChange: (val: number) => {
          this.usingLdap(val);
        },
        hideFieldsOnValue: {
          select: [
            {
              hideClasses: ['no-sso-or-ldap'],
              valueFunction: (val) => val === 1 || this.usesSSO
            },
            {
              hideClasses: ['noldap'],
              value: 1
            },
            {
              hideClasses: ['ldap'],
              value: 0
            }
          ]
        }
      },
      {
        containerClass: 'userField coordinator dedicated shared reporting viewer',
        type: 'flipswitch',
        name: 'active',
        title: 'SHARED.Active',
        onText: this.translate.instant('SHARED.Yes'),
        offText: this.translate.instant('SHARED.No'),
        value: 1,
        default: 1,
      },
      {
        containerClass: 'userField coordinator dedicated shared reporting viewer ldap',
        module: Module.LDAP,
        name: 'ldapServer',
        title: this.translate.instant('MGMT_DETAILS.LDAP_Server'),
        type: 'selectmenu',
        required: true,
        canClear: false,
        multiple: false,
        options: this.subscriber.LDAPServers,
        onChange: (value: any) => {
        }
      },
      {
        containerClass: 'ldap userField coordinator dedicated observation shared reporting viewer',
        required: true,
        unique: true,
        inputtype: 'verbatim',
        module: Module.LDAP,
        name: 'LDAPusername',
        title: this.translate.instant('SHARED.Username'),
        type: 'text',
        minlength: 1,
        size: 20,
        addButton: "SHARED.Search",
        onClick: (value: any) => {
          this.logger.log("we got a click");
          const id: string = this.messageID ? '#userEditLDAPusername' : '#userAddLDAPusername';
          const username: string = <any>$(id).val();

          this.searchLDAP(username);
        }
      },
      {
        containerClass: 'noldap userField coordinator dedicated observation shared reporting viewer',
        required: true,
        unique: true,
        inputtype: 'verbatim',
        name: 'username',
        title: this.translate.instant('SHARED.Username'),
        type: 'text',
        minlength: 1,
        size: 20,
        onChange: (value: any) => {
          // this.updateLdapFields(value);
        }
      },
      {
        containerClass: 'userField coordinator dedicated observation shared reporting viewer no-sso-or-ldap',
        name: 'password',
        title: this.translate.instant('AUTH.Password'),
        type: 'password',
        size: 20
      },
      {
        containerClass: 'userField coordinator dedicated observation shared reporting viewer no-sso-or-ldap',
        name: 'password2',
        title: this.translate.instant('MGMT_DETAILS.User_again'),
        type: 'password',
        equalTo: 'password',
        size: 20
      },
      {
        containerClass: 'userField observation',
        required: true,
        name: 'description',
        title: this.translate.instant('SHARED.Description'),
        minlength: 1,
        type: 'text',
        size: 20
      },
      {
        containerClass: 'ldap userField coordinator dedicated shared reporting wristband viewer',
        disabled: true,
        required: true,
        module: Module.LDAP,
        name: 'LDAPfirstname',
        title: this.translate.instant('MGMT_DETAILS.First_Name'),
        minlength: 1,
        type: 'text',
        size: 20
      },
      {
        containerClass: 'ldap userField coordinator dedicated shared reporting wristband viewer',
        disabled: true,
        required: true,
        module: Module.LDAP,
        name: 'LDAPlastname',
        title: this.translate.instant('MGMT_DETAILS.Last_Name'),
        minlength: 1,
        type: 'text',
        size: 20
      },
      {
        containerClass: 'noldap userField coordinator dedicated shared reporting wristband observer viewer',
        required: true,
        name: 'firstname',
        title: this.translate.instant('MGMT_DETAILS.First_Name'),
        minlength: 1,
        type: 'text',
        size: 20
      },
      {
        containerClass: 'noldap userField coordinator dedicated shared reporting wristband observer viewer',
        required: true,
        name: 'lastname',
        title: this.translate.instant('MGMT_DETAILS.Last_Name'),
        minlength: 1,
        type: 'text',
        size: 20
      },
      {
        containerClass: 'userField coordinator dedicated shared reporting observation observer viewer',
        name: 'defaultLanguage',
        title: this.translate.instant('SHARED.Language'),
        type: 'selectmenu',
        required: true,
        canClear: false,
        multiple: false,
        default: this.subscriber.getDefaultLanguage(),
        options: this.subscriber.languageList
      },
      {
        containerClass: 'ldap userField dedicated shared reporting',
        disabled: true,
        module: Module.LDAP,
        name: 'LDAPemail',
        title: this.translate.instant('MGMT_DETAILS.Email_Address'),
        type: 'email',
        size: 40
      },
      {
        containerClass: 'ldap userField dedicated shared reporting',
        disabled: true,
        module: Module.LDAP,
        name: 'LDAPcell',
        title: this.translate.instant('SHARED.Phone_Number'),
        type: 'tel',
        size: 12
      },
      {
        containerClass: 'noldap userField dedicated shared reporting',
        name: 'email',
        title: this.translate.instant('MGMT_DETAILS.Email_Address'),
        type: 'email',
        size: 40
      },
      {
        containerClass: 'noldap userField dedicated shared reporting',
        name: 'cell',
        title: this.translate.instant('SHARED.Phone_Number'),
        type: 'tel',
        size: 12
      },
      {
        containerClass: 'userField dedicated shared observation',
        inputtype: 'verbatim',
        unique: true,
        name: 'nfcID',
        title: this.translate.instant('MGMT_DETAILS.NFC_ID'),
        type: 'text',
        size: 20
      },
      // {
      //   containerClass: 'userField coordinator wristband dedicated shared observation observer',
      //   title: this.translate.instant('SHARED.Locations'),
      //   name: 'locations',
      //   type: 'selectmenu',
      //   placeholder: this.translate.instant('SHARED.All_Locations'),
      //   multiple: true,
      //   valueProperty: 'locationID',
      //   options: this.locations,
      //   func: (ref) => {
      //     return ref.name;
      //   },
      //   onChange: (value: any) => this.syncLocationsFields(value)
      // },
      {
        containerClass : 'custom-field-button-folder',
        label: 'SHARED.Location_Access',
        type: 'button',
        name: 'nodeSelections',
        class: 'button-styled',
        title: 'SHARED.Manage_Access',
        module: Module.LOCATION_HIERARCHY,
        onClick: () =>{  this.showHierarchyInformation(); }
      },
      {
        containerClass: 'userField dedicated shared reporting observer',
        title: this.translate.instant('SHARED.Shift'),
        name: 'shift',
        type: 'selectmenu',
        placeholder: this.translate.instant('MGMT_DETAILS.Select_a_Shift'),
        multiple: false,
        options: this.shifts,

      },
      {
        containerClass: 'userField dedicated shared observer',
        name: 'supervisorID',
        title: this.translate.instant('SHARED.Supervisor'),
        type: 'selectmenu',
        placeholder: this.translate.instant('SHARED.--none'),
        placeholderValue: 0,
        multiple: false,
        valueProperty: 'supervisorID',
        options: this.supervisors,
        func: (userID) => this.userService.getFullname(userID)
      },
      {
        containerClass: 'userField wristband coordinator dedicated shared reporting observer',
        name: 'groups',
        title: this.translate.instant('SHARED.Team(s)'),
        type: 'selectmenu',
        multiple: true,
        options: this.teams,
        // valueProperty: 'groupID',
        originalOrder: true,
        // test: (teamItem: any) => !_.get(teamItem, 'disabledAt'),
        func: (teamItem: any) => this.teamService.teamName(teamItem),
        onChange: (groupIDs: any[]) => {
          const id: string = this.messageID ? '#userEdittype' : '#userAddtype';
          const accountType: string = <any>$(id).val();

          if (!_.includes(['reporting', 'viewer', 'observer', 'wristband'], accountType)) {
            this.syncPrimaryGroupField(_.map(groupIDs, Number));
          }
        }
      },
      {
        containerClass: 'userField coordinator dedicated shared',
        name: 'primaryGroup',
        title: this.translate.instant('MGMT_DETAILS.Primary_Team'),
        type: 'selectmenu',
        placeholder: this.translate.instant('SHARED.--none'),
        placeholderValue: 0,
        required: true,
        multiple: false,
        valueProperty: 'groupID',
        test: (ref) => {
          if (ref.hasOwnProperty('disabledAt') && ref.disabledAt) {
            return false;
          } else {
            return true;
          }
        },
        func: (teamItem) => this.teamService.teamName(teamItem)
      },
      {
        containerClass: 'userField dedicated shared',
        name: 'certifications',
        title: this.translate.instant('SHARED.Certifications'),
        module: Module.CERTIFICATIONS,
        type: 'selectmenu',
        multiple: true,
        valueProperty: 'certificationID',
        options: 'this.certificationsService.certifications',
        test: (ref) => {
          if (ref.hasOwnProperty('disabledAt') && ref.disabledAt) {
            return false;
          } else {
            return true;
          }
        }, func: (certItem) => this.formBuilderService.certificationName(certItem)
      },
      {
        containerClass: 'userField dedicated shared',
        name: 'roles',
        title: this.translate.instant('LAYOUT.Roles'),
        module: Module.ROLES,
        type: 'selectmenu',
        multiple: true,
        valueProperty: 'roleID',
        options: 'this.roleService.roles',
        test: (ref) => {
          if (ref.hasOwnProperty('disabledAt') && ref.disabledAt) {
            return false;
          } else {
            return true;
          }
        }, func: this.roleService.roleName
      },
      {
        containerClass: 'userField dedicated shared',
        name: 'permissions',
        title: this.translate.instant('SHARED.EDIT_Permissions'),
        type: 'selectmenu',
        required: true,
        multiple: true,
        options: _.cloneDeep(this.permissionService.permissions),
        test: (ref) => {
          ref.description = this.translate.instant(ref.description);
          if (ref.id === 'corvex') {
            return _.get(this.userdataService.Permissions, 'corvex');
          } else if (ref.id === 'sadmin') {
            return _.get(this.userdataService.Permissions, 'sadmin') || _.get(this.userdataService.Permissions, 'corvex');
          } else {
            return true;
          }
        },
      },
      // {
      //   containerClass: 'userField coordinator dedicated shared reporting viewer',
      //   name: 'hireDate',
      //   title: this.translate.instant('SHARED.Hire_Date'),
      //   type: 'date',
      //   size: 20,
      //   func: (date) => moment(date*1000).calendar(),
      //   default: 0
      // },
      // {
      //   containerClass: 'userField coordinator dedicated shared reporting viewer',
      //   name: 'terminationDate',
      //   title: this.translate.instant('SHARED.Termination_Date'),
      //   type: 'date',
      //   size: 20,
      //   func: (date) => moment(date*1000).calendar(),
      //   default: 0
      // },
      {
        name: 'hireDate',
        type: 'customElement',
        component: DateRangePickerComponent,
        containerClass: 'userField coordinator dedicated shared reporting viewer observer',
        inputs: {
          useUTC: true,
          startLabel: 'SHARED.Hire_Date',
          singleDatePicker: true,
          showDropdowns: true,
          emptyDefaultValue: true
        }
      },
      {
        name: 'terminationDate',
        type: 'customElement',
        component: DateRangePickerComponent,
        containerClass: 'userField coordinator dedicated shared reporting viewer observer',
        inputs: {
          useUTC: true,
          startLabel: 'SHARED.Termination_Date',
          singleDatePicker: true,
          showDropdowns: true,
          emptyDefaultValue: true
        }
      },
      {
        containerClass: 'userField coordinator dedicated shared reporting viewer',
        type: 'flipswitch',
        name: 'disabledAutoLogout',
        title: 'MGMT_DETAILS.Disable_Auto_Logout',
        onText: this.translate.instant('SHARED.Yes'),
        offText: this.translate.instant('SHARED.No'),
        value: 1,
        default: 0,
        canView: Permission.Corvex
      },
    ]
  };

  private user: any;
  private previousUserType: string = 'dedicated';
  locationID: any = [];
  locationName: any = [];
  protected deleteHandler: any = (formData: any) => {
    formData = this.encodeData(formData);
    this.replaceMessageIdWith('userID', formData);
    return this.userService.handleDeleteUser(formData);
  };
  protected updateHandler: any = (formData: any) => {
    formData = this.encodeData(formData);
    if (this.locationID) {
      formData.nodeSelections = this.locationID;
    }
    this.replaceMessageIdWith('userID', formData);
    // force a pull of the updated account data after save
    return this.userService.handleUpdateUser(formData, false);
  };

  protected addHandler: any = (formData: any) => {
    formData = this.encodeData(formData);
    if (this.locationID) {
      formData.nodeSelections = this.locationID;
    }
    return this.userService.handleAddUser(formData);
  }

  protected refreshHandler: any = () => {
    this.logger.log('refreshing');
    return this.accountService.refresh();
  }

  private encodeData(formData): any {
    if (formData.usesLdap) {
      // need to interpolate some data from LDAP fields
      const fields = ['username', 'firstname', 'lastname', 'email', 'cell'];
      _.each(fields, fname => {
        const lField = `LDAP${fname}`;
        formData[fname] = formData[lField];
        delete formData[lField];
      });
      formData.password = 'usesLDAP';
    } else if (formData.usesSSO) {
			formData.password = 'usesSSO';
			formData.ldapServer = -1;
		}

    formData.supervisorID = formData.supervisorID ? +formData.supervisorID : 0;
    formData.primaryGroup = formData.primaryGroup ? +formData.primaryGroup : 0;
    return formData;
  }
  private decodeData(userData): any {
    if (userData.ldapServer > 0) {
      userData.usesLdap = 1;
      // need to interpolate some data from LDAP fields
      const fields = ['username', 'firstname', 'lastname', 'email', 'cell'];
      _.each(fields, fname => {
        const lField = `LDAP${fname}`;
        userData[lField] = userData[fname];
      });
		} else if (userData.ldapServer < 0) {
			userData.usesSSO = 1;
			userData.usesLdap = 0;
    } else {
      userData.usesLdap = 0;
			userData.usesSSO = 0;
    }
    this.usingLdap(userData.usesLdap);
		this.usingSSO(userData.usesSSO);
    return userData;
  }

  // protected refreshHandler: any = () => this.accountService.refresh();

  protected saveErrorHandler: any = (res: any) => {
    // there was an error savingp
    let status = res.reqStatusText;
    if (status.match(/conform to policy/)) {
      this.customValidate.validateServerFunction(this.formConfig, this.policyErrorPopoverConfig, 'password');
    } else if (status.match(/Duplicate NFC/)) {
      this.customValidate.validateServerFunction(this.formConfig, this.uniqueNfcPopoverConfig, 'nfcID');
    } else if (status.match(/Duplicate/)) {
      this.customValidate.validateServerFunction(this.formConfig, this.uniqueErrorPopoverConfig, 'username');
    }
  }

  private policyErrorPopoverConfig: IPopoverConfig = {
    title: this.translate.instant('MGMT_DETAILS.PASSWORD_PolicyTitle'),
    description:  this.translate.instant('MGMT_DETAILS.PASSWORD_PolicyMessage'),
    hideActions: true
  };
  private uniqueNfcPopoverConfig: IPopoverConfig = {
    title: this.translate.instant('MGMT_DETAILS.Duplicate_NFC'),
    description: this.translate.instant('MGMT_DETAILS.Duplicate_nfc_error'),
    hideActions: true
  };
  private uniqueErrorPopoverConfig: IPopoverConfig = {
    title: this.translate.instant('SHARED.Duplicate_Username'),
    description: this.translate.instant('SHARED.Duplicate_error'),
    hideActions: true
  };

  private transformUnixToDate(date){
    moment(date*1000).calendar();
  }


  constructor(
    private logger: NGXLogger,
    protected route: ActivatedRoute,
    protected formBuilderService: FormBuilderService,
    protected elementRef: ElementRef,
    protected popoverService: PopoverService,
    protected location: Location,
    protected loadingService: LoadingService,
    private userService: UserService,
    private teamService: TeamsService,
    private roleService: RolesService,
    private permissionService: PermissionsService,
    private accountService: AccountsService,
    private userdataService: UserdataService,
    private shift: ShiftService,
    private subscriber: SubscriberService,
    public translate: TranslateService,
    public alertController: AlertController,
    private filterService: FilterElementService,
    private popoverController: PopoverController,
    private hierarchyGroupingService : HierarchyGroupingService
  ) {
    super(route, formBuilderService, elementRef, popoverService, location, loadingService, translate);

  }

  protected prepareFormConfig(): void {
    if (this.messageID) {
      this.title = this.translate.instant('MGMT_DETAILS.Edit_User');
      this.formConfig.prefix = 'userEdit';
      this.formConfig.save = this.translate.instant('SHARED.Save_Changes');
      this.formConfig.del = this.translate.instant('MGMT_DETAILS.Delete_User');

      this.updatePopoverConfig.title = this.translate.instant('MGMT_DETAILS.Update_User');
      this.updatePopoverConfig.description = this.translate.instant('MGMT_DETAILS.User_description0');

      this.deletePopoverConfig.title = this.translate.instant('MGMT_DETAILS.Delete_User');
      this.deletePopoverConfig.description = this.translate.instant('MGMT_DETAILS.User_description1');
    }
  }

  protected getData(): any {
    if (this.messageID) {
      this.user = this.accountService.getByID(+this.messageID);


      let userData: any = this.accountService.decode(this.user);
      if (userData.type === 'observation') {
        userData.description = userData.firstname;
      }

      userData = this.decodeData(userData);

      if (_.get(userData, 'groups')) {
        const groupsFieldConfig: any = _.find(this.formConfig.fields, { name: 'primaryGroup' });
        groupsFieldConfig.options = _.filter(this.teamService.teams.data, (team: any) => _.includes(userData.groups, team.groupID));
      }

      if (_.get(userData, 'preferences')) {
        userData.defaultLanguage = _.get(userData.preferences, 'defaultLanguage', '');
        userData.disabledAutoLogout = +_.get(userData.preferences, 'disabledAutoLogout', 0);
      }

      if (userData.hireDate) {
        userData.hireDate = userData.hireDate * 1000;
      }

      if (userData.terminationDate) {
        userData.terminationDate = userData.terminationDate * 1000;
      }

      return userData;
    } else {
      return { 'type' : 'dedicated' };
    }
  }

  protected async prepareDataAsync(): Promise<any> {
    return this.roleService.refresh();
  }

  protected onFinish(): void {
    const userData: any = this.accountService.decode(this.user);
    this.updateLocationField(userData.type);
    this.syncGroupsField(userData.type);
    this.syncPrimaryGroupField(userData.groups);
    this.previousUserType = _.get(userData, 'type', 'dedicated');

    // if the user has limited locations, remove the placeholder for the locations field and make the field
    // required
    if (this.messageID) {
      this.hideElementsByClass(this.user.type);
      if (this.subscriber.usesModule(Module.LOCATION_HIERARCHY)) {
        if (this.user.nodeSelections.length > 0) {
          this.locationID = this.user.nodeSelections;
          if (this.subscriber.usesModule(Module.LOCATION_HIERARCHY)) {
            this.hierarchyGroupingFunction(this.locationID);
          }
        } else {
          if (this.user.locations.length > 0) {
            this.locationID = this.user.locations;
           } else {
            this.locationID = ['node:0'];
          }
          this.hierarchyGroupingFunction(this.locationID);
        }
      } else {
        this.locationID = this.user.locations;
      }
      this.syncLocationsFields(this.locationID);
    } else {
      this.hideElementsByClass('dedicated');
    }
  }

  private hideElementsByClass(className: string): void {
    const baseFieldClass: string = 'userField';

    $(`.${baseFieldClass}`).hide().find(':input').prop('disabled', true);
    $(`.${baseFieldClass}.${className}`).show().find(':input').prop('disabled', false);

    _.each(_.filter(this.formConfig.fields, 'hideFieldsOnValue'), (field) => {
      const isFieldClassValid = _.includes(field.containerClass, className);
      const isFieldModuleValid = _.has(field, 'module') && this.subscriber.usesModule(field.module) || !_.has(field, 'module');

      if (!isFieldModuleValid || !isFieldClassValid) {
        return;
      }

      this.formBuilderService.hideFieldsOnValue(field, this.formConfig, field.getValue() || 0);

    });
  }

  private syncPrimaryGroupField(groupIDs: number[] = []): void {
    const id: string = this.messageID ? '#userEditprimaryGroup' : '#userAddprimaryGroup';
    const data: number = +$(id).val();
    const fieldOptions: any = Object.assign(_.find(this.formConfig.fields, { name: 'primaryGroup' }), {
      options: _.filter(this.teamService.teams.data, (team: any) => _.includes(groupIDs, team.groupID)),
      disabled: groupIDs.length < 2
    });

    this.formBuilderService.replaceSelectOptionsWith(id, this.formConfig, fieldOptions, { primaryGroup: data });
  }

  private syncLocationsFields(locationIDs: any[] ): void {
    const fieldId: string = this.messageID ? '#userEditlocations' : '#userAddlocations';

      const selectedLocationIDs: string[] | string = <string[] | string>$(fieldId).val();
      const fieldData: any = {};
      fieldData.locations = _.isArray(selectedLocationIDs) ? _.map(selectedLocationIDs, Number) : [+selectedLocationIDs];

      if (fieldData.locations.length === 1 && fieldData.locations[0] === 0) {
        // there is no location zero - that's a placeholder
        fieldData.locations = [];
      }
    let nodeArray = [];
    locationIDs.forEach(element => {
      if (typeof(element) === 'string' && element.match(/^node:/)) {
        nodeArray = _.concat(nodeArray, this.hierarchyGroupingService.getChildIDsAsList(element, true, false));
      } else {
        nodeArray.push(+element);
      }
    });
    setTimeout(() => {
      this._updateFieldByLocation('shift', nodeArray, (locs: any[]) => this.shiftByLocations(locs));
      this._updateFieldByLocation('supervisorID', nodeArray, (locs: any[]) => this.accountService.getSupervisors(locs));
      this._updateFieldByLocation('groups', nodeArray, (locs: any[]) => this.teamsByLocation(locs));
    });
  }

  private resetLdapFields(): void {
          const id: string = this.messageID ? '#userEdittype' : '#userAddtype';
          const accountType: string = <any>$(id).val();

          if (!_.includes(['reporting', 'viewer', 'observer', 'wristband'], accountType)) {
            // this.syncPrimaryGroupField(_.map(groupIDs, Number));
          }

  }
  private usingSSO(value?: number): boolean {
    if (value !== undefined) {
      this.usesSSO = !!value;
    }
    return this.usesSSO;
  }
  private usingLdap(value?: number): boolean {
    if (value !== undefined) {
      this.usesLDAP = !!value;
    }
    return this.usesLDAP;
  }
  private async searchLDAP(username: string): Promise<void> {
    if (this.usesLDAP) {
      const fieldId: string = this.messageID ? '#userEditldapServer' : '#userAddldapServer';
      const sval: number = 0 + <any>$(fieldId).val();
      if (sval) {
        // we are using ldap - ask the backend for an LDAP user
        // await this.loadingService.enable();
        await this.loadingService.enable();
        let matches = await this.subscriber.searchLDAP(sval, username);
        await this.loadingService.disable();
        let fields = [];
        let data = [];
        if (matches && matches.length === 1) {
          // we found exactly 1 match
          let updates = [];
          let updateData = {};
          const fields = ['firstname', 'lastname', 'email', 'cell'];
          _.each(fields, field => {
            let f = field + 'F';
            if (_.has(matches[0], f)) {
              // found a match; update the field data
              const fname = `LDAP${field}`;
              const fieldRef = <any>_.find((<any>this).formConfig.fields, <any>{name: fname});
              if (fieldRef) {
                updates.push(fieldRef);
                updateData[fname] = matches[0][f];
              }
            }
          });
          if (updates.length) {
            this.formBuilderService.updateFields((<any>this).formConfig, updates, updateData);
          }
        } else {
          this.alertController.create({
            header: this.translate.instant('SHARED.Whoops'),
            message: `The user ${username} does not exist`,
            cssClass: 'custom-alert',
            buttons: [{ text: this.translate.instant('SHARED.OK') }]
          }).then((alert: any) => {
            alert.present();
            setTimeout(() => {
              alert.dismiss();
            }, 5000);
          });
        }
      }
    }
  }
  private updateLocationField(type: string ): void {
    const fieldId: string = this.messageID ? '#userEditlocations' : '#userAddlocations';

    const f: any = _.find(this.formConfig.fields, { 'name': 'locations' });
    if (f) {
      // update the field definition to use only the fields the user has access to
      let selectedLocationIDs: string[] | string = <string[] | string>$(fieldId).val();
      if (this.userdataService.locations.length || type === 'observation' || type === 'coordinator') {
        f.required = true;
        f.placeholder = this.translate.instant('SHARED.--none');
        f.placeholderValue = 0;
        f.options = this.locations;
        // selectedLocationIDs = [];
        if (type === 'observation' || type === 'coordinator') {
          f.label = 'Location';
          f.multiple = false;
          if (selectedLocationIDs && selectedLocationIDs.length > 1) {
            selectedLocationIDs = _.isArray(selectedLocationIDs) ? [selectedLocationIDs[0]] : [<string>selectedLocationIDs];
          }
      } else {
          f.label = this.translate.instant('SHARED.Locationss');
          f.multiple = true;
        }
      } else {
        f.required = false;
        f.label = this.translate.instant('SHARED.Locationss');
        f.placeholder = this.translate.instant('SHARED.All_Locations');
        delete f.placeholderValue;
        f.options = this.locations;
        f.multiple = true;
      }
      const fieldData: any = {};
      fieldData.locations = _.isArray(selectedLocationIDs) ? _.map(selectedLocationIDs, Number) : [+selectedLocationIDs];
      if (fieldData.locations.length === 1 && fieldData.locations[0] === 0) {
        // there is no location zero - that's a placeholder
        fieldData.locations = [];
      }
      this.redefineField(fieldId, f, fieldData, 'locations' );

      this._updateFieldByLocation('shift', fieldData.locations, (locs: any[]) => this.shiftByLocations(locs));
      this._updateFieldByLocation('supervisorID', fieldData.locations, (locs: any[]) => this.accountService.getSupervisors(locs));
      this._updateFieldByLocation('groups', fieldData.locations, (locs: any[]) => this.teamsByLocation(locs));
    }
  }

  private _updateFieldByLocation(field: string, locations: any[], getOptions: any) {
    // okay locations are set.   based upon what is selected, show relevant teams, supervisors, and shifts
    const fieldId = this.messageID ? '#userEdit' + field : '#userAdd' + field;

    let l = _.cloneDeep(locations);

    if (!l.length) {
      l = _.cloneDeep(this.locations);
    }

    const r: any = _.find(this.formConfig.fields, { 'name': field });
    r.options = getOptions(locations);
    const selection: string[] | string = <string[] | string>$(fieldId).val();
    const fieldData: any = {};

    if (r.multiple) {
      fieldData[field] = _.isArray(selection) ? _.map(selection, Number) : [+selection];
    } else {
      fieldData[field] = selection;
    }
    this.redefineField(fieldId, r, fieldData, field);
  }

  private syncGroupsField(accountType: string): void {
    const fieldId: string = this.messageID ? '#userEditgroups' : '#userAddgroups';
    const isDedicatedSharedUser: boolean = _.includes(['dedicated', 'shared'], accountType);
    const isReportingViewerUser: boolean = _.includes(['reporting', 'viewer'], accountType);
    const isObservation: boolean = accountType === 'observation';
    const isCoordinator: boolean = accountType === 'coordinator';
    const isObserver: boolean = accountType === 'observer';
    const isWristband: boolean = accountType === 'wristband';
    const selectedGroupIds: string[] | string = <string[] | string>$(fieldId).val();
    const fieldData: any = {};
    let params: any = {
      required: false,
      title: this.translate.instant('SHARED.Team(s)'),
      multiple: true
    };
    fieldData.groups = _.isArray(selectedGroupIds) ? _.map(selectedGroupIds, Number) : [+selectedGroupIds];

    if (isDedicatedSharedUser) {
      this.syncPrimaryGroupField(fieldData.groups);
      this.redefineField(fieldId, params, fieldData, 'groups');
    } else if (isReportingViewerUser) {
      this.redefineField(fieldId, params, fieldData, 'groups');
    } else if (isObserver) {
      params = {
        required: true,
        title: this.translate.instant('SHARED.Team'),
        multiple: false,
        placeholder: this.translate.instant('SHARED.--none'),
        placeholderValue: 0
      };
      this.redefineField(fieldId, params, fieldData, 'groups');
    }
  }

  private redefineField(fieldId: string, params: any, fieldData: any, name): void {
    const fieldOptions: any = Object.assign(_.find(this.formConfig.fields, { name }), params);
    this.formBuilderService.replaceSelectOptionsWith(fieldId, this.formConfig, fieldOptions, fieldData);
  }

  private shiftByLocations(locationsIds) {
    let locations = _.map(locationsIds, (locationId) => this.userService.getLocation(locationId));
    if (_.isEmpty(locations)) {
      locations = this.userService.getUserLocations(this.userdataService.locations, false);
    }
    return this.shift.getSelectMenuObjectsByLocations(locations);
  }

  private teamsByLocation(locations){
    let teamObj = this.filterService.buildTeamMenu(locations, false);
    return teamObj.dropDownOptions;
  }
  public showHierarchyInformation(): void {
    this.popoverController.create(<any>{
      component: ManageLocationComponent,
      animated: false,
      componentProps: { 'checkboxValue': this.locationID, 'subscriberName': this.subscriber.subInfo.subscriberName }
    }).then((element: HTMLIonPopoverElement) => {
      element.present();
      element.onDidDismiss().then((event) => {
        const selectedLocations = _.get(event, 'data');
        if (selectedLocations) {
          this.locationID = _.get(selectedLocations, 'Ids');
          this.syncLocationsFields(this.locationID);
          if (this.messageID) {
            this.formBuilderService.markFieldAsChanged('#userEditForm', 'nodeSelections', this.user.nodeSelections, this.locationID);
          }
          this.hierarchyGroupingFunction(this.locationID);
        }
      });
    });
  }
  hierarchyGroupingFunction(title) {
    const id: string = this.messageID ? '#userEditnodeSelections' : '#userAddnodeSelections';
    $('.selected-location').remove();
    $('.location-view-div').remove();
    $('.node-selection-display').remove();
    $(`${id}`).removeClass('hidden');
    if (title != '') {
      this.locationName = [];
      title.forEach((value) => {
        const typeCheck = typeof (value) // string
        if (typeCheck === 'string') {
          if (value === 'node:0') {
            this.locationName.push(this.translate.instant('SHARED.All_Locations'));
          } else {
            const node = this.hierarchyGroupingService.getFolderByID(value);
            this.locationName.push(node.title);
          }
        } else {
          const locInfo = this.userService.findLocation(value);
          this.locationName.push(locInfo.name);
        }
      })

      const buttonContainElement = $(`<div class="ui-field-contain custom-field-button-folder location-view-div"><label>&nbsp;</label><button type="button" id="editGroupBtn" class="button-styled">${this.translate.instant('SHARED.Manage_Access')}</button>`);
      const fieldContainElement = $(`<div class="node-selection-display"></div>`);
      setTimeout(() => {
        $(`${id}_label`).after(fieldContainElement);
        this.locationName.forEach(data => {
          const locName = data;
          const locations = $(`<h5 class="selected-location">${locName}</h5>`);
          $('.node-selection-display').append(locations);
        });
        $(`${id}`).addClass('hidden');
        $(`${id}_container`).after(buttonContainElement);
        this.elementRef.nativeElement.querySelector('#editGroupBtn')
          .addEventListener('click', () => this.showHierarchyInformation());
      });


    }
  }
}

