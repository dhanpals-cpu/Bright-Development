import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Events } from '@services/events/events.service';
import {
  AccountsService,
  LoadingService,
  PermissionsService,
  ResizeHandlerService,
  TableService,
  TeamsService,
  UserdataService,
  UserService,
  UtilsService,
  ShiftService,
  FilterElementService,
  IHeaderSetting
} from '@services';
import { BaseListPage } from '../abstractList/abstractBaseList.page';
import { TranslateService } from '@ngx-translate/core';
import * as Mark from 'mark.js';
import * as _ from 'lodash';
import { tryParse } from 'selenium-webdriver/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage extends BaseListPage {


  protected enableChangeDetectionMode: boolean = true;
  private userTypes = {
    'dedicated': 'SHARED.Dedicated',
    'shared': 'SHARED.Shared',
    'observation': 'SHARED.Observation',
    'observer': 'SHARED.Observer',
    'reporting': 'SHARED.Reporting',
    'viewer': 'SHARED.Viewer',
    'coordinator': 'SHARED.Coordinator',
    'wristband': 'SHARED.WristbandOnly'
  };
  private menuItem: any = ['accountType', 'permissionLevel', 'location', 'shift', 'team'];
  public showFilterBody = false;
  public filterComps: any = [];
  public searchField: any = '';
  public filterObject = this.accountsService.filterObject;
  public title: string = 'SHARED.USERS';
  public tableId: string = 'userTable';
  public dataTableOptions = {};
  public headerSetting: IHeaderSetting = {
    title: this.translate.instant('SHARED.USERS'),
    filter: {
      showFilter: true,
      isActive: false
    },
    showSearchField: true,
  };

  public tableAttr = {
    class: 'editUser',
    rowprop: 'data-mid',
    rowvaluefrom: 'userID',
    exportExcel: true,
    colVis: true,
    virtualScroll: true,
    customButtons: [{
      name: 'add_user',
      title: this.translate.instant('MGMT_DETAILS.Add_User'),
      action: () => {
        this.router.navigate(['pages/management/users/user'])
      } ,
    },
    {
      name: 'add_blk_user',
      // title: this.translate.instant('MGMT_DETAILS.Add_User'),
      title: this.translate.instant('MGMT_DETAILS.Add_Bulk_User'),
      action: () => {
        this.router.navigate(['pages/management/users/bulk-user'])
      } ,
      testCase: () => {
               return this.permissionsService.canView('corvex');
              }
    }

  ],
    test: (rec) => {
      if (rec.hasOwnProperty('disabledAt') && rec.disabledAt) {
        return false;
      } else {
        if (_.get(rec, 'permissions.corvex')) {
          return _.get(this.userDataService, 'Permissions.corvex');
        } else {
          return true;
        }
      }
    },
    columns: [
      {
        id: 'type',
        title: this.translate.instant('SHARED.TYPE'),
        headerClass: 'table-header',
        func: (val) => {
          if (val === undefined || val === null || val === '' || val === 'individual' || val === 'dedicated') {
            return this.translate.instant(this.userTypes['dedicated']);
          } else {
            return this.userTypes[val] ? this.translate.instant(this.userTypes[val]) : '';
          }
        }
      },
      {
        id: 'lastUpdate',
        title: this.translate.instant('MGMT_LIST.LAST_ACTIVITY'),
        headerClass: 'table-header',
        class: 'nowrap',
        cellprop: 'data-sort',
        cellval: 'lastUpdate',
        render: (time, type) => {
          return type === 'sort' ? time : this.utils.dateTimeFormat(time, 'Never');
        }
      },
      {
        id: 'lastZone',
        title: this.translate.instant('MGMT_LIST.LAST_ZONE'),
        headerClass: 'table-header',
        func: (zoneID, row) => {
          let ret = 'N/A';
          if (row.lastLocation) {
            const l = this.userService.findLocation(row.lastLocation);
            if (l) {
              if (zoneID === 0) {
                ret = l.name + '/Site-Wide';
              } else {
                const z = this.userService.findZone(zoneID, l, null);
                if (z) {
                  ret = l.name + '/' + z.name;
                }
              }
            }
          }
          return ret;
        }
      },
      {
        id: 'avatar',
        title: this.translate.instant('MGMT_LIST.PICTURE'),
        fromID: 'userID',
        headerClass: 'table-header picture-column',
        nosort: true,
        func: (id, ref) => {
          return `<img width='40' src='${this.userService.accountAvatar(id, 48, null, true)}'>`;
        }
      },
      {
        id: 'username',
        title: this.translate.instant('MGMT_LIST.USERNAME'),
        headerClass: 'table-header'
      },
      {
        id: 'lastname',
        title: this.translate.instant('MGMT_LIST.LAST_NAME'),
        headerClass: 'table-header'
      },
      {
        id: 'firstname',
        title: this.translate.instant('MGMT_LIST.FIRST_NAME'),
        headerClass: 'table-header'
      },
      {
        id: 'email',
        title: this.translate.instant('MGMT_LIST.EMAIL'),
        headerClass: 'table-header'
      },
      {
        id: 'cell',
        title: this.translate.instant('MGMT_LIST.PHONE'),
        headerClass: 'table-header'
      },
      {
        id: 'team',
        title: this.translate.instant('SHARED.TEAM'),
        headerClass: 'table-header',
        fromID: 'groups',
        cellprop: 'data-group',
        cellval: 'groups',
        func: (groups, row) => {
          let Tstring = '';
          if (groups) {
            groups.forEach((val) => {
              // tslint:disable-next-line: triple-equals
              if (row.primaryGroup && val == row.primaryGroup) {
                Tstring += '*&nbsp;';
              }
              Tstring += this.teamsService.teamNameByID(val) + '</br>';
            });
          }
          return Tstring;

        }
      },
      {
        id: 'shift',
        title: this.translate.instant('MGMT_LIST.SHIFT'),
        headerClass: 'table-header',
        func: (shift, row) => {
          return this.shift.name(shift);
        }
      },
      {
        id: 'supervisorID',
        title: this.translate.instant('SHARED.Supervisor'),
        headerClass: 'table-header',
        func: (userID, row) => {
          if (userID) {
            return this.accountsService.fullname(userID);
          } else {
            return '';
          }
        }
      },
      {
        id: 'permissions',
        title: this.translate.instant('MGMT_LIST.PERMISSIONS'),
        headerClass: 'table-header',
        fromID: 'permissions',
        cellprop: 'data-perm',
        cellval: 'permissions',
        func: (permissions) => {
          let Tstring = '';
          if (permissions) {
            _.each(permissions, (val, key) => {
              const f: any = _.find(this.permissionsService.permissions.data, { id: key });
              if (f) {
                Tstring += this.translate.instant(f.description) + '<br />';
              }
            });
          }
          return Tstring;
        }
      },
      {
        id: 'locations',
        title: this.translate.instant('MGMT_LIST.LOCATIONS'),
        headerClass: 'table-header',
        func: (val) => {
          if (!val.length) {
            return this.translate.instant('SHARED.All_Locations');
          } else {
            let r = '';
            _.each(val, (loc) => {
              const l = this.userService.findLocation(loc);
              if (l) {
                if (r !== '') {
                  r += ', ';
                }
                r += l.name;
              } else {
                if (r !== '') {
                  r += ', ';
                }
                r += this.translate.instant('SHARED.All_Locations');
              }
            });
            return r;
          }
        }
      },
      {
        id: 'powerPoints',
        title: this.translate.instant('PROFILE.Power_Points'),
        headerClass: 'table-header',
      },
      {
        id: 'nfcID',
        title: this.translate.instant('MGMT_DETAILS.NFC_ID'),
        headerClass: 'table-header',
      },
      {
        id: 'active',
        title: this.translate.instant('MGMT_LIST.Active_Inactive'),
        headerClass: 'table-header',
        fromID: 'active',
        cellprop: 'data-perm',
        cellval: 'active',
        func: (active) => {
          let activeString = '';
          if (active===1) {
            activeString=this.translate.instant('MGMT_LIST.Active');
          }else{
            activeString=this.translate.instant('MGMT_LIST.Inactive');
          }
          return activeString;
        }
      },
    ],
    onClickRow: (messageID: string): any => this.router.navigate(['pages/management/users/user', { messageID }])
  };

  ionViewWillEnter() {
    const clearSearch: string = this.route.snapshot.paramMap.get('clearSearch');
    if (clearSearch) {
      this.searchField = '';
      this.accountsService.filterObject.searchString = null;
      $('.observationSearchField').val(null);
    } else {
      this.searchField = this.accountsService.filterObject.searchString;
      $('.observationSearchField').val(this.searchField);
    }

    this.filterComps = this.filterElem.buildFilterObjects(this.menuItem, this.accountsService.filterObject, false);
    this.headerSetting.filter.isActive = this.filterElem.filterValuesAvailable(this.filterComps);

    /** Filter related ops */
    this.events.subscribe('ccs:filterObject', this.filterListener);
    this.events.subscribe('ccs:searchString', this.searchStringListener);
    this.events.subscribe('ccs:clearMenu', this.clearMenuListener);
    this.events.subscribe('ccs:accountsUpdate', this.accountsUpdated);
    super.ionViewWillEnter();
  }

  ionViewWillLeave() {
    this.resizeHandler.removeResizeHandler('userTable');
    this.events.unsubscribe('ccs:accountsUpdate', this.accountsUpdated);
    this.events.unsubscribe('ccs:clearMenu', this.clearMenuListener);
    this.events.unsubscribe('ccs:searchString', this.searchStringListener);
    this.events.unsubscribe('ccs:filterObject', this.filterListener);
    super.ionViewWillLeave();
  }



  private filterListener = (data) => {
  //  data.locations.push(0);
    this.accountsService.filterObject = data; // get filter elem

  };


  private searchStringListener = (data) => {
    this.accountsService.filterObject = data; // get filter elem
    const uData = this.accountsService.getUserlist(this.userDataService.locations);
    this.buildIndices(uData);
    this.renderTable(this.accountsService.filterData(uData));

  };


  private clearMenuListener = (data) => {
    if (data) {
      this.zone.run(() => {
        // tslint:disable-next-line:max-line-length
        this.filterComps = this.filterElem.buildFilterObjects(this.menuItem, this.accountsService.filterObject, false);
        this.filterObject = this.accountsService.filterObject;
        let checkFilterActive = false;
        _.each(this.filterComps, comp => {
          if (comp.value && comp.value.length > 0) {
            checkFilterActive = true;
            return false;
          }
        });
        this.headerSetting.filter.isActive = checkFilterActive;
        this.updateTableData();
      });
    }
  };

  private accountsUpdated = () => {
    const uData = this.accountsService.getUserlist(this.userDataService.locations);
    this.buildIndices(uData);
    const filtData = this.accountsService.filterData(uData);
    this.handleTableUpdate(filtData);
  }

  public getAdditionData = (when: Number = 0) => {

    const uData = this.accountsService.getUserlist(this.userDataService.locations);
    this.buildIndices(uData);
    const filtData = this.accountsService.filterData(uData);
    return Promise.resolve(filtData);
  }


  private buildIndices(uDataArray){
    _.each(uDataArray, uData => {
      uData.searchIndex  = this.buildIndex(uData);
    })
  }

  private buildIndex(uData){
    let retObj = [];

    // type
    retObj.push(_.toLower(uData.type));


    // fname
    retObj.push(_.toLower(uData.firstname));

    // lname
    retObj.push(_.toLower(uData.lastname));

    //combined name
    retObj.push(_.toLower(uData.firstname + ' ' +uData.lastname));

    // user name
    retObj.push(_.toLower(uData.username));


    // locations
    let r = '';
    _.each(uData.locations, (loc) => {
      const l = this.userService.findLocation(loc);
      if (l) {
        if (r !== '') {
          r += ', ';
        }
        r += _.toLower(l.name);
      }
    });
    if(!uData.locations.length){
      r = _.toLower('All Locations');
    }
    retObj.push(r);

    // team
    let t = '';
    _.each(uData.groups, grp =>{
      t +=   _.toLower(this.teamsService.teamNameByID(grp)+ ' ');

    });
    retObj.push(t);

    // shift
    retObj.push(_.toLower(this.shift.name(uData.shift)));

    //supervisor
    retObj.push(_.toLower(this.accountsService.fullname(uData.supervisorID)))

    //permissions
    let p = '';
    _.each(uData.permissions, (val, key)=>{
      p = _.toLower(key) + ' ';
    });
    retObj.push(p);

    retObj.push(_.toLower(uData.nfcID));

    return retObj;
  }

  public onFinish = () => {

   }

  public toggleFilterBody(val) {
    this.showFilterBody = val;
    if(val){
      $('.custom-controls').hide();
    }else{
      $('.custom-controls').show();
    }
  }

  private markSearchResult(selector: string): void {
    const searchString: string = _.get(this.filterObject, 'searchString');

    if (searchString) {
      const instance = new Mark(document.querySelector(`${selector}.dataTable tbody`));

      if (instance) {
        instance.mark(searchString, { element: 'span', className: 'highlight' });
      }
    }
  }

  constructor(
    protected tableService: TableService,
    protected loadingService: LoadingService,
    protected resizeHandler: ResizeHandlerService,
    protected route: ActivatedRoute,
    private router: Router,
    private userDataService: UserdataService,
    private utils: UtilsService,
    private userService: UserService,
    private teamsService: TeamsService,
    private permissionsService: PermissionsService,
    private accountsService: AccountsService,
    private shift: ShiftService,
    public translate: TranslateService,
    private filterElem: FilterElementService,
    private events: Events,
    private zone: NgZone
  ) {
    super(tableService, loadingService, resizeHandler, route, translate);
    this.dataTableOptions = Object.assign({}, this.dataTableOptions, {
      scrollX: true,
      autoWidth: false,
      order: [
        [5, 'asc'], [6, 'asc']
      ],
      columnDefs: [{
        visible: false,
        targets: [1, 2, 3, 7, 8, 14, 16]
      },
      {
        orderable: false,
        targets: [3]
      }],
      scrollCollapse: true,
      paging: false,
      searching: false,
      language: {
        searchPlaceholder: this.translate.instant('SHARED.Search'),
        search: '',
        emptyTable: this.translate.instant('SHARED.emptyTable'),
        sZeroRecords: this.translate.instant('SHARED.sZeroRecords'),
        className: 'hidden',
      },
      info: false,
      stateSave: true,
      dom: 'Blfrtip',
      buttons: {
        buttons: [
          {
            extend: 'colvis',
            columns: ':not(.no-vis)',
            text: this.translate.instant('MGMT_LIST.Select_Columns'),
            className: 'button-styled hidden',
            collectionLayout: 'three-column',
          }
        ]
      },
    });
  }

  public onTableDraw() {
    this.markSearchResult('#userTable');
  }

}
