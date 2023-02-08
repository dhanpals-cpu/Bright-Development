import { Component, OnInit, AfterViewChecked, ViewChild, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FetchService } from 'src/app/services/fetch.service';
import { AuthService } from '../services/auth.service';
import { NavparamService } from '../services/navparam.service';
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { AlertController, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { IonSlides } from '@ionic/angular';
import { File, IWriteOptions, FileEntry } from '@ionic-native/file/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';

declare let paypal: any;

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {



  options: CameraOptions = {
    sourceType: this.camera.PictureSourceType.CAMERA,
    quality: 100,

    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    //  quality: 100,
    //  destinationType: this.camera.DestinationType.FILE_URI,
    //  encodingType: this.camera.EncodingType.JPEG,
    //  mediaType: this.camera.MediaType.PICTURE
  };
  fileoptions: CameraOptions = {
    quality: 100,

    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: 2,
    // mediaType: this.camera.MediaType.PICTURE,
    //  quality: 100,
    //destinationType: this.camera.DestinationType.DATA_URL,
    //encodingType: this.camera.EncodingType.JPEG,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  };
  constructor(
    private http: HttpClient,
    private router: Router,
    private fetch: FetchService,
    private authService: AuthService,
    private navparamService: NavparamService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public actionSheetController: ActionSheetController,
    private camera: Camera,
    private file: File,
    private crop: Crop,
  ) { }

  public user = this.authService.getUser();
  public btype: any;
  public imgURI: any;
  public categories: any;
  public products: any;
  public product: any;
  public selectedImage: any;
  public model: any = {};
  public showaddfrm = 0;
  public pagetitle = 'Add Product';
  public selectedfile: any;
  public imageSelectedStatus = false;
  public imageUrl = environment.site_url + 'products/';
  public defaultImage = environment.site_url + 'images/noimage.jpg';


  @ViewChild('slides', { static: true }) slider: IonSlides;
  segment = 0;

  slideOptsProgressbar = {
    pagination: {
      el: '.swiper-pagination',
      type: 'custom',
      renderCustom: (swiper, current, total) => {
        return this.customProgressBar(current, total);
      }
    }
  };
  slidesDidLoad(slides) {
    //slides.startAutoplay();
  }

  private customProgressBar(current: number, total: number): string {
    const ratio: number = current / total;

    const progressBarStyle: string = 'style=\'transform: translate3d(0px, 0px, 0px) scaleX(' + ratio + ') scaleY(1); transition-duration: 300ms;\'';
    const progressBar: string = '<span class=\'swiper-pagination-progressbar-fill\' ' + progressBarStyle + '></span>';

    let progressBarContainer: string = '<div class=\'swiper-pagination-progressbar\' style=\'height: 4px; top: 6px; width: 100%;\'>';
    progressBarContainer += progressBar;
    progressBarContainer += '</span></div>';

    return progressBarContainer;
  }
  async segmentChanged() {
    await this.slider.slideTo(this.segment);
  }

  async slideChanged() {
    this.segment = await this.slider.getActiveIndex();
  }

  addform = new FormGroup({

    user_id: new FormControl('', []),
    category_id: new FormControl('', [
      Validators.required,
    ]),
    product_name: new FormControl('', [
      Validators.required,
    ]),
    total: new FormControl('', [
      Validators.required,
    ]),
    description: new FormControl('', []),
    is_discount: new FormControl(false, []),
    discount: new FormControl('', []),
    image: new FormControl('', []),
  });

  editform = new FormGroup({

    product_id: new FormControl('', []),
    user_id: new FormControl('', []),
    product_name: new FormControl('', [
      Validators.required,
    ]),
    total: new FormControl('', [
      Validators.required,
    ]),
    category_id: new FormControl('', [
      Validators.required,
    ]),
    description: new FormControl('', []),
    is_discount: new FormControl(false, []),
    discount: new FormControl('', []),
    image: new FormControl('', []),
  });
  
  ionViewWillEnter() {

    const rdata = this.navparamService.getNavData();
    if (rdata == 'Add Product') {
      this.showaddfrm = 1;
      this.pagetitle = "Add Product";
      this.model = [];
    } else {
      this.model = this.navparamService.getNavData();
      this.navparamService.setNavData('');
      // console.log(this.model);
      this.showaddfrm = 2;
      this.pagetitle = "Edit Product";
    }


    this.fetch.getCategories().subscribe((res) => {
      this.categories = res.data;

    });


  }


  ngOnInit() {

  }


  async selectImage(uploader) {
    if (uploader == 'video_1') {
      const actionSheet = await this.actionSheetController.create({
        header: "Select source",
        buttons: [{
          text: 'Load from Library',
          handler: () => {
           
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
        ]
      });
      await actionSheet.present();

    } else {


      const actionSheet = await this.actionSheetController.create({
        header: "Select source",
        buttons: [{
          text: 'Load from Library',
          handler: () => {
            console.log(uploader);
          
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
        ]
      });
      await actionSheet.present();
    }
  }

  readFile(file: any, fname: any) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      const formData = new FormData();
      formData.append('auth_id', this.user.user_id);
      formData.append('image_name', fname);
      formData.append(fname, imgBlob, file.name);

      const loading = await this.loadingCtrl.create({ message: 'Uploading...' });
      await loading.present();
      this.http.post(environment.api_url + 'uploadProductImage', formData).subscribe(async (res) => {
        if (res['image_name'] == 'image_1') {
          this.model.image_1 = res['filename'];
        }
        if (res['image_name'] == 'image_2') {
          this.model.image_2 = res['filename'];
        }
        if (res['image_name'] == 'image_3') {
          this.model.image_3 = res['filename'];
        }
        if (res['image_name'] == 'video_1') {
          this.model.video_1 = res['filename'];
        }

        const toast = await this.toastCtrl.create({
          message: 'Image Updated !',
          duration: 2000,
          color: 'dark'
        });
        await toast.present();
        loading.dismiss();
        console.log(res);

      });


    };
    reader.readAsArrayBuffer(file);
  }
  takePicture(fname) {
    this.camera.getPicture(this.options).then((imageData) => {

      this.cropImage(imageData, fname)

    }, (err) => {
      // Handle error
    });
  }
  takePicturefile(fname) {
    this.camera.getPicture(this.fileoptions).then((imageData) => {
      //this.imgURI = 'data:image/jpeg;base64,' + imageData;
      //let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.cropImage(imageData, fname)

    }, (err) => {
      // Handle error
    });
  }

  cropImage(fileUrl, fname) {
    this.crop.crop(fileUrl, { quality: 50 })
      .then(
        newPath => {
          this.file.resolveLocalFilesystemUrl(newPath).then((entry: FileEntry) => {
            entry.file(file => {
              console.log(file);
              this.readFile(file, fname);
            });
          });

          // this.showCroppedImage(newPath.split('?')[0] , fname)
        },
        error => {
          //  alert('Error cropping image' + error);
        }
      );
  }

  showCroppedImage(ImagePath, fname) {
    // this.isLoading = true;
    var copyPath = ImagePath;
    var splitPath = copyPath.split('/');
    var imageName = splitPath[splitPath.length - 1];
    var filePath = ImagePath.split(imageName)[0];

    this.file.readAsDataURL(filePath, imageName).then(base64 => {

      if (fname == 'image_1') {
        this.model.image_1 = base64;
      }
      if (fname == 'image_2') {
        this.model.image_2 = base64;
      }
      if (fname == 'image_3') {
        this.model.image_3 = base64;
      }


      //  this.isLoading = false;
    }, error => {
      //  alert('Error in showing image' + error);
      //  this.isLoading = false;
    });
  }

  addForm(val) {

    if (val > 0) {
      this.showaddfrm = val;
      this.pagetitle = "Add Product";
    } else {
      this.showaddfrm = 0;
      this.model = [];
      this.pagetitle = "Add Product";
    }
  }

  


  async onSubmitAdd() {
    const loading = await this.loadingCtrl.create({ message: 'Saving...' });
    await loading.present();
    const fd = new FormData();
    fd.append('user_id', this.addform.value.user_id);
    fd.append('category_id', this.addform.value.category_id);
    fd.append('product_name', this.addform.value.product_name);
    fd.append('description', this.addform.value.description);
    fd.append('is_discount', this.addform.value.is_discount);
    fd.append('discount', this.addform.value.discount);
    fd.append('total', this.addform.value.total);
    fd.append('feature_image', this.selectedfile, this.selectedfile.name);
    this.fetch.addProduct(fd).subscribe(
      // If success
      async (data) => {

        if (data['status'] == 'error') {
          const toast = await this.toastCtrl.create({ message: data['message'], duration: 2000, color: 'dark' });
          await toast.present();
          loading.dismiss();

        } else {

          const toast = await this.toastCtrl.create({ message: data['message'], duration: 2000, color: 'dark' });
          await toast.present();
          loading.dismiss();
          this.products = data['products'];
          this.navparamService.setNavData(this.products);
          this.router.navigate(['/products']);
          this.addform.reset();
          // this.showaddfrm=0;
          this.model = [];
        }
      },
      // If there is an error
      async (data) => {
        const alert = await this.alertCtrl.create({ message: 'There is an error', buttons: ['OK'] });
        loading.dismiss();
        await alert.present();
      }
    );
  }

  async onSubmitEdit() {
    if (this.imageSelectedStatus) {
      const loading = await this.loadingCtrl.create({ message: 'Saving...' });
      await loading.present();
      const fd = new FormData();
      fd.append('user_id', this.addform.value.user_id);
      fd.append('product_id', this.addform.value.product_id);
      fd.append('category_id', this.addform.value.category_id);
      fd.append('name', this.addform.value.name);
      fd.append('product_details', this.addform.value.product_details);
      fd.append('is_discount', this.addform.value.is_discount);
      fd.append('discount_value', this.addform.value.discount_value);
      fd.append('total', this.addform.value.total);
      fd.append('feature_image', this.selectedfile, this.selectedfile.name);
      this.fetch.updateProduct(fd).subscribe(
        // If success
        async (data) => {

          if (data['status'] == 'error') {
            const toast = await this.toastCtrl.create({ message: data['message'], duration: 2000, color: 'dark' });
            await toast.present();
            loading.dismiss();

          } else {

            const toast = await this.toastCtrl.create({ message: data['message'], duration: 2000, color: 'dark' });
            await toast.present();
            loading.dismiss();
            this.products = data['products'];
            this.navparamService.setNavData(this.products);
            this.router.navigate(['/products']);
            this.editform.reset();
            //  this.showaddfrm=0;
            this.model = [];
          }
        },
        // If there is an error
        async (data) => {
          const alert = await this.alertCtrl.create({ message: 'There is an error', buttons: ['OK'] });
          loading.dismiss();
          await alert.present();
        }
      );
    } else {

      const loading = await this.loadingCtrl.create({ message: 'Saving...' });
      await loading.present();

      this.fetch.updateProduct(this.model).subscribe(
        // If success
        async (data) => {

          if (data['status'] == 'error') {
            const toast = await this.toastCtrl.create({ message: data['message'], duration: 2000, color: 'dark' });
            await toast.present();
            loading.dismiss();

          } else {

            const toast = await this.toastCtrl.create({ message: data['message'], duration: 2000, color: 'dark' });
            await toast.present();
            loading.dismiss();
            this.products = data['products'];
            this.navparamService.setNavData(this.products);
            this.router.navigate(['/products']);
            this.editform.reset();
            //  this.showaddfrm=0;
            this.model = [];
          }
        },
        // If there is an error
        async (data) => {
          const alert = await this.alertCtrl.create({ message: 'There is an error', buttons: ['OK'] });
          loading.dismiss();
          await alert.present();
        }
      );

    }
  }

  async onFileSelected(event: any) {
    if (event.target.files[0].size > 5242880) {
      const toast = await this.toastCtrl.create({
        message: 'File is too big! Please Upload Video upto 5 Mb only. ',
        duration: 2000,
        color: 'dark'
      });
      await toast.present();
      // alert("File is too big!");
      return false;
    };

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = e.target.result;

      };
      reader.readAsDataURL(event.target.files[0]);
    }
    this.selectedfile = event.target.files[0] as File;
    const fname = event.target.id;
    this.imageSelectedStatus = true;
    // fd.append(fname, this.selectedfile, this.selectedfile.name);

  }


  async deleteConfirm(item, index) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Delete Product!',
      message: 'Are You <strong>Sure</strong>?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async (blah) => {
            ////
          }
        }, {
          text: 'Okay',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Deleting...' });
            await loading.present();
            this.fetch.deleteProduct(item).subscribe(
              // If success
              async (data) => {

                if (data['status'] == false) {
                  const toast = await this.toastCtrl.create({ message: data['msg'], duration: 2000, color: 'dark' });
                  await toast.present();
                  loading.dismiss();

                } else {

                  const toast = await this.toastCtrl.create({ message: data['msg'], duration: 2000, color: 'dark' });
                  await toast.present();
                  loading.dismiss();

                  this.products.splice(index, 1);


                }
              },
              // If there is an error
              async (data) => {
                const alert = await this.alertCtrl.create({ message: 'There is an error', buttons: ['OK'] });
                loading.dismiss();
                await alert.present();
              }
            );

          }
        }
      ]
    });

    await alert.present();
  }
  async removeContent(name) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Remove Media!',
      message: 'Are You <strong>Sure</strong>?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: async (blah) => {
            ////
          }
        }, {
          text: 'Okay',
          handler: async () => {
            if (name == 'image') {
              this.model.image = '';
            }


          }
        }
      ]
    });

    await alert.present();
  }

  show_content(index) {
    this.showaddfrm = 3;
    this.segment = index;

  }

}



