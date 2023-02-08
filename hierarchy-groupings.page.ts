import { AfterViewInit, Component , ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopoverController } from '@ionic/angular';
import { HierarchyGroupingInfoComponent } from '@modules/management/pages/list/hierarchy-groupings/components';
import { LoadingService,HFolder, HierarchyGroupingService , SubscriberService } from '@services';

import * as _ from "lodash";
@Component({
  selector: 'app-hierarchy-groupings',
  templateUrl: './hierarchy-groupings.page.html',
  styleUrls: ['./hierarchy-groupings.page.scss'],
})
export class HierarchyGroupingsPage implements AfterViewInit {
  public title: string = this.translate.instant('SHARED.Hierarchy_Groupings');
  public tableId: any = 'hierarchyGroupingTable';
  public tableData : HFolder[];
  private isInitialised: boolean;
  public subscriberName: string;
  private onNewData = () => {
    this.getData();
  };
  constructor(
    protected translate: TranslateService,
    private popoverController: PopoverController,
    private hierarchyService: HierarchyGroupingService,
    protected loadingService: LoadingService,
    private subscriber: SubscriberService
  ) { 
    
  }

  public showHierarchyInformation(): void {
    this.popoverController.create(<any>{
      component: HierarchyGroupingInfoComponent,
      animated: false
    }).then((element: HTMLIonPopoverElement) => {
      element.present();
    });
  }
  ionViewWillEnter() {
    this.subscriberName = this.subscriber.subInfo.subscriberName;
    //this.onNewData();
    if (this.isInitialised) {
      this.loadingService.enable();
      this.init();
    }
    this.isInitialised = true; 
  }

  ngAfterViewInit() {
    this.getData();
  }

  private getData() {
    this.loadingService.enable();

    setTimeout(() => {
      this.init();
    });
  }

  private init(): void {
    
    const groupings = this.hierarchyService.refresh();
    groupings.then((data : any) => {
      this.tableData = _.cloneDeep(data);
       this.tableData = _.map(this.tableData);
       this.hierarchyService.translateData(this.tableData);
       if (this.hierarchyService.parentHierarchy && this.hierarchyService.parentHierarchy.firstParentID) {
        const val = _.find(this.tableData, {folderID:this.hierarchyService.parentHierarchy.firstParentID });
        if(val!=undefined){
          val.isOpened = true;
        }else{
          this.hierarchyService.parentHierarchy = {};
        }
        }
        if (this.hierarchyService.parentHierarchy && this.hierarchyService.secondParentHierarchy && this.hierarchyService.secondParentHierarchy.folderID) {
          this.tableData.filter((folder: any) => {
            var folders = folder.children;
             this.getObjectKeys(folders,this.hierarchyService.secondParentHierarchy.folderID);
            
          }) 
         }
         
       return this.tableData;
    });
    this.loadingService.disable();
  }
  getObjectKeys(obj , key) {
    for (var prop in obj) {
      var sub = obj[prop];
      if (prop=="folderID") {
      if(obj[prop] == key){
        obj.isOpened = true;
        return  obj;
      } 
      }
      if (typeof(sub) == "object") {
        this.getObjectKeys(sub , key);
      }
    }
  }
  public toggleParent(folderId: number): void {
    this.tableData.filter((folder: any) => {
      return folder.folderID !== folderId;
    }).forEach((folder_group) => {
      folder_group.isOpened = false;
    });
  }
  
}
