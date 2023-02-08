import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import {
  CommsService,
  FormBuilderService,
  ImageUploaderService,
  LoadingService,
  PopoverService,
  UserService,
  UserdataService,
  ZoneService,
  AccountsService,
  AssetsService,
  SettingsService,
  UtilsService,
  Module
} from '@services';
import { BaseDetailsPage } from '../abstractDetails/abstractBaseDetails.page';
import { ContentListComponent } from '@modules/management/pages/details/content/components';

import * as _ from 'lodash';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.page.html',
  styleUrls: ['./asset.page.scss'],
})
export class AssetPage extends BaseDetailsPage {

  public title: string = this.translate.instant('MGMT_DETAILS.Add_Asset');
  public locations = this.userService.getUserLocations(this.userdataService.locations, false);
  private zones = this.getGroupedZonesByLocations(this.userdataService.locations);
  private accounts = this.accountService.getUserlist(this.userdataService.locations);

  private imageID: string;
  protected newForm: any = {
    id: 'assetAddForm',
    cancelButton: 'assetAddCancel',
    saveButton: 'assetAddSave'
  };

  protected editForm: any = {
    id: 'assetEditForm',
    cancelButton: 'assetEditCancel',
    saveButton: 'assetEditSave',
    deleteButton: 'assetEditDelete'
  };

  protected formConfig: any = {
    autocomplete: false,
    canClear: true,
    containers: true,
    prefix: 'assetAdd',
    del: null,
    save: this.translate.instant('MGMT_DETAILS.Add_Asset'),
    // save: this.translate.instant('Add_Asset'),
    cancel: this.translate.instant('SHARED.Cancel'),
    fields: [
      {
        required: true,
        inputtype: 'verbatim',
        name: 'name',
        title: this.translate.instant('MGMT_DETAILS.Asset_Name'),
        type: 'text',
        size: 20
      },
      {
        required: false,
        inputtype: 'verbatim',
        name: 'translation_name',
        title: this.translate.instant('MGMT_DETAILS.Asset_Name_Translation'),
        type: 'textTranslations',
        fromID: 'translations',
        size: 20,
        maxlength: 50
      },
      {
        required: true,
        name: 'assetType',
        title: this.translate.instant('SHARED.Asset_Group'),
        type: 'selectmenu',
        canClear: false,
        placeholder: '',
        valueProperty: 'messageID',
        options: this.settingsService.assetType,
        func: (assetTypeItem: any) => assetTypeItem.messageTitle,
        test: (ref) => !_.get(ref, 'disabledAt'),
        onChange: (id: string) => {
          const assetTypeData = this.settingsService.getItem('assetType', +id, false, false);
          this.onParentIdsChange.next(assetTypeData.contentItems || []);
        }
      },
      {
        required: false,
        inputtype: 'verbatim',
        name: 'identifier',
        title: this.translate.instant('MGMT_DETAILS.Asset_ID'),
        type: 'text',
        size: 30
      },
      {
        required: false,
        name: 'imageID',
        title: this.translate.instant('MGMT_DETAILS.Asset_Image'),
        type: 'image',
        multiple: true,
        addButton: this.translate.instant('SHARED.Upload_Image'),
        updateButton: this.translate.instant('SHARED.Replace_Image'),
        imageSize: '75px',
        containerClass: 'post-container'
      },
      {
        required: true,
        containerClass: 'report-field obsdets team worker zone observation',
        title: this.translate.instant('SHARED.Location'),
        name: 'location',
        type: 'selectmenu',
        placeholder: '',
        multiple: false,
        canClear: false,
        valueProperty: 'locationID',
        options: this.locations,
        func: (ref) => ref.name,
        test: function (ref) {
          if (ref.hasOwnProperty('disabledAt') && ref.disabledAt) {
            return false;
          } else {
            return true;
          }
        },
        onChange: (locationIds: string) => this.onLocationChange(locationIds)
      },
      {
        title: this.translate.instant('SHARED.Zone'),
        name: 'zone',
        type: 'selectmenu',
        containerClass: 'observation beacon proximity',
        multiple: false,
        placeholder: '',
        options: this.zones,
        required: true,
        canClear: false,
        originalOrder: true
      },
      {
        title: this.translate.instant('MGMT_DETAILS.Go_Tos'),
        type: 'selectmenu',
        name: 'users',
        multiple: true,
        valueProperty: 'userID',
        placeholder: '',
        options: this.accounts,
        test: function (ref) {
          if (ref.hasOwnProperty('disabledAt') && ref.disabledAt) {
            return false;
          } else {
            if (ref.hasOwnProperty('type') && (ref.type === 'dedicated' || ref.type === 'shared')) {
              return true;
            } else {
              return false;
            }
          }
        },
        func: (ref) => {
          return this.userService.getFullname(ref.userID);
        }
      },
      {
        type: 'flipswitch',
        name: 'active',
        title: this.translate.instant('MGMT_DETAILS.Asset_Active'),
        onText: this.translate.instant('SHARED.Yes'),
        offText: this.translate.instant('SHARED.No'),
        value: 1,
        onChange: (value: boolean) => this.active = value ? 1 : 0
      },
      {
        type: 'customElement',
        name: 'contentItems',
        component: ContentListComponent,
        // title: this.translate.instant('MGMT_DETAILS.Asset_Content'),
        module: Module.CONTENT
      }
    ]
  };

  private onParentIdsChange: Subject<number[]> = new Subject<number[]>();
  private active: number;

  protected deleteHandler: any = (formData: any) => {
    this.prepareFormData(formData);
    return this.assetsService.handleDeleteAsset([formData.assetID]);
  };
  protected updateHandler: any = (formData: any) => {
    this.prepareFormData(formData);
    this.encodeTranslations(formData);
    if (formData.translations) {
      formData.translations = JSON.parse(formData.translations);
    }
    formData.images = _.filter([this.imageID]);
    const assetData = this.getData();
    const formZone = formData['zone'];
    const formLocation = formData['location'];
    formData = _.omit(formData, ['location', 'zone']);
    if (formZone !== assetData['zone']) {
      formData['zone'] = formZone;
    }
    if (formLocation !== assetData['location']) {
      formData['location'] = formLocation;
    }
    if (_.has(formData, 'contentItems')) {
      formData.contentItems = JSON.parse(formData.contentItems);
    }
    const jsonData = _.keyBy([Object.assign({}, formData)], 'assetID');
    delete jsonData[formData.assetID].assetID;
    return this.assetsService.handleUpdateAsset({ 'assets': JSON.stringify(jsonData) });
  };
  protected addHandler: any = (formData: any) => {
    this.prepareFormData(formData);
    this.encodeTranslations(formData);
    if (this.imageID) {
      formData.images = JSON.stringify([this.imageID]);
    }
    return this.assetsService.handleAddAsset(formData);
  };

  constructor(
    protected route: ActivatedRoute,
    protected formBuilderService: FormBuilderService,
    protected elementRef: ElementRef,
    protected popoverService: PopoverService,
    protected location: Location,
    protected loadingService: LoadingService,
    private commsService: CommsService,
    protected translate: TranslateService,
    private imageUploaderService: ImageUploaderService,
    private userService: UserService,
    private userdataService: UserdataService,
    private zoneService: ZoneService,
    private accountService: AccountsService,
    private assetsService: AssetsService,
    private settingsService: SettingsService,
    private utils: UtilsService
  ) {
    super(route, formBuilderService, elementRef, popoverService, location, loadingService, translate);
  }

  protected prepareFormConfig(): void {
    if (this.messageID) {
      this.title = this.translate.instant('Edit Asset');

      this.formConfig.prefix = 'assetEdit';
      this.formConfig.save = this.translate.instant('SHARED.Save_Changes');
      this.formConfig.cancel = this.translate.instant('SHARED.Cancel');
      this.formConfig.del = this.translate.instant('MGMT_DETAILS.Delete_Asset');

      this.deletePopoverConfig.title = this.translate.instant('MGMT_DETAILS.Delete_Asset');
      this.deletePopoverConfig.description = this.translate.instant('MGMT_DETAILS.Asset__description0');

      this.updatePopoverConfig.title = this.translate.instant('MGMT_DETAILS.Update_Asset');
      this.updatePopoverConfig.description = this.translate.instant('MGMT_DETAILS.Asset__description1');
    }
  }

  protected getData(): any {
    const assetTypeId: number = +this.route.snapshot.paramMap.get('typeId');
    let assetData: any = { assetType: assetTypeId };

    if (this.messageID) {
      assetData = _.clone(_.find(this.assetsService.asset.data, <any>{ assetID: +this.messageID }));
      const users: string = _.first(assetData.users);

      this.utils.decodeTranslations(assetData, ['translation_name'], ['name']);
      if (_.includes(users, ',')) {
        assetData.users = _.split(users, ',');
      }

      assetData.zone = assetData.zone === 0 ? `${assetData.location}:${assetData.zone}` : assetData.zone.toString();
      assetData.imageID = _.first(assetData.images);
    }

    this.initContentItemsField(assetData.assetType);

    return assetData;
  }

  protected prepareDataAsync() {
    const dataHandler: Promise<any> = _.isEmpty(this.assetsService.asset.data) ? this.assetsService.refresh() : Promise.resolve();
    return dataHandler.then(() => {
      const assetData = this.getData();
      const imageField: any = _.find(this.formConfig.fields, { name: 'imageID' });

      this.formConfig.hidden = { 'assetID': assetData.assetID, 'assetImageID': assetData.imageID };
      const imageId: number = _.first(assetData.images);
      imageField.currentThumbnail = imageId ? this.commsService.objectURI(imageId, true) : '';
    });
  }

  protected onFinish(): void {
    const id: string = this.messageID ? 'assetEditimageID' : 'assetAddimageID';
    const callbacks = {
      onSuccess: (data: any) => {
        this.setImageValue(data.objectID);
        this.customValidate.validateFailed('success');
      },
      onError: () => {
        this.customValidate.validateFailed('error');
        this.setImageValue();
      },
      onRemove: () => this.setImageValue()
    };

    this.imageUploaderService.init(`#${id}`, { formData: { type: 'ppe' } }, null, callbacks);

    const data = this.getData();
    const locationId: number = _.get(data, 'location');
    this.imageID = _.first(data.images);

    if (locationId) {
      this.onLocationChange(locationId.toString());
    }
  }

  private prepareFormData(formData: any): void {
    if (formData.assetType) {
      formData.assetType = parseInt(formData.assetType, 10);
    } else {
      formData.assetType = 0;
    }
    if (formData.location) {
      formData.location = parseInt(formData.location, 10);
    } else {
      formData.location = 0;
    }
    if (formData.zone && !_.includes(formData.zone, ':0')) {
      formData.zone = parseInt(formData.zone, 10);
    } else {
      formData.zone = 0;
    }

    formData.users = formData.users ? _.flatten([formData.users]) : [];
    formData.users = JSON.stringify(formData.users);

    formData['active'] = this.active;
    this.replaceMessageIdWith('assetID', formData);
  }

  private setImageValue(value: string = null): void {
    if (this.formConfig.enableChangeDetectionMode) {
      const imageID = _.first(_.get(this.getData(), 'images'));
      this.formBuilderService.markFieldAsChanged(`#${this.editForm.id}`, 'imageID', imageID, value || 0);
    }
    const imageId: string = this.messageID ? 'assetEditassetImageID' : 'assetAddassetImageID';

    $(`#${imageId}`).attr('src', value);
    this.imageID = value;
  }

  private encodeTranslations(formData): void {
    this.utils.encodeTranslations(formData, ['translation_name'], ['name']);
  }

  private onLocationChange(locationIds: string) {
    const ids = [parseInt(locationIds, 10)];
    const id: string = this.messageID ? '#assetEditzone' : '#assetAddzone';
    const userid: string = this.messageID ? '#assetEditusers' : '#assetAddusers';
    const zone: string | number = <string | number>$(id).val();
    const users: string[] | number[] = <string[] | number[]>$(userid).val();
    const fieldOptions: any = Object.assign(_.find(this.formConfig.fields, { name: 'zone' }), {
      options: this.getGroupedZonesByLocations(ids)
    });
    const usersOptions: any = Object.assign(_.find(this.formConfig.fields, { name: 'users' }), {
      options: this.accountService.getUserlist(ids)
    });
    this.formBuilderService.replaceSelectOptionsWith(id, this.formConfig, fieldOptions, { zone });
    this.formBuilderService.replaceSelectOptionsWith(userid, this.formConfig, usersOptions, { users });
  }

  private getGroupedZonesByLocations(ids: number[]): any[] {
    const zoneOptions: any[] = this.zoneService.getGroupedZonesByLocations(ids);
    const optionText: string = `${this.translate.instant('SHARED.Site-wide')} (${this.translate.instant('MGMT_DETAILS.Shared_Asset')})`;

    _.each(zoneOptions, (option) => {
      const initZone: any = _.find(option.children, (child) => _.includes(child.id, ':0'));

      if (initZone) {
        initZone.text = optionText;
      }
    });

    return zoneOptions;
  }

  private initContentItemsField(assetType: number) {
    const assetTypeData = this.settingsService.getItem('assetType', assetType, false, false);

    if (assetTypeData && assetTypeData.contentItems) {
      const contentItemsField: any = _.find(this.formConfig.fields, { name: 'contentItems' });

      if (!contentItemsField.inputs) {
        contentItemsField.inputs = { parentIds: assetTypeData.contentItems, onParentIdsChange: this.onParentIdsChange };
      }

      if (assetTypeData.contentItems.length) {
        contentItemsField.title = this.translate.instant('SHARED.Asset_Content_Group');
        contentItemsField.inputs.title = this.translate.instant('MGMT_DETAILS.Asset_Content');
      }
    }
  }

}
