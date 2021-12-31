import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { AppConstant } from '../../app-constant.constant';
import { CitService } from '../cit.service';
import { AlertService, AlertType } from '../../alert/alert.service';
import { CommonModalService } from '../../common/common-modal.service';
import { ExpandHelper, Request } from '../../dynamic-forms/model/request';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../common/loading/loading.service';
//import { ApiService } from '../../services/api/api.service';
import { AuthenticationService } from '../../services/auth/authentication.service';
import { User } from '../../model/user';
import {
    BreadcrumbDescriptor,
    BreadcrumbIconRequest,
    BreadcrumbItem,
    BreadcrumbItemHome,
} from '../../nav/breadcrumb-wrapper/breadcrumb-descriptor.type';
import { BreadcrumbService } from '../../nav/breadcrumb-wrapper/breadcrumb.service';

@Component({
    selector: 'app-submit-code',
    templateUrl: './submit-code.component.html',
    styleUrls: ['./submit-code.component.scss'],
})
export class SubmitCodeComponent
    extends ExpandHelper
    implements OnInit, OnDestroy, AfterViewInit {
    request: Request;
    formJSONCustomerApp: any;
    formJSONTechnicalApp: any;
    formJSONUploadFormApp: any;
    dataCustomerApp: any = {};
    dataTechnicalApp: any = {};
    dataUploadFormApp: any = {};
    //formDataCustomerApp: any = { "sc_num": 123456 };
    next = false;
    id: number;
    user: User;
    loading: boolean;
    restURL = '/sc/';
    customFormUpdateCount = 0;
    config: any; //scForm: any = { isAlgo: false, isMilitry: false };
    submitted = false;
    public current = 0;
    public steps = [
        { label: 'Customer Application' },
        { label: 'Technical Application' },
        { label: 'Submit Code' },
    ];
    constructor(
        private commonModalService: CommonModalService,
        private citService: CitService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private loadingService: LoadingService,
        private breadcrumbService: BreadcrumbService
    ) {
        super(null);
    }
    changeDetect(evt: any, formData) {
        this[formData][evt.formQuestion.name] = evt.formQuestion.value;
        if (evt.formQuestion.name === 'sc_num') {
            this.validateSCNumber();
        }
    }
    ngOnInit(): void {
        this.config = AppConstant;
        //dynamic
        this.user = this.authenticationService.user;
        this.loading = true;
        this.route.paramMap.subscribe((paramMap) => {
            let sc_num = (paramMap && paramMap["params"] && paramMap["params"].sc_num);
            const breadcrumbItem: BreadcrumbItem = {
                label: `Customer Order #${sc_num || ''}`,
                icon: BreadcrumbIconRequest,
                routerLink: null,
            };
            this.breadcrumbService.setBreadcrumb(
                new BreadcrumbDescriptor(breadcrumbItem, [BreadcrumbItemHome])
            );
            this.dataCustomerApp = { sc_num: sc_num || '' };
            this.getForm('renderCustomerForm', this.dataCustomerApp);
        });
    }

    validateSCNumber() {
        this.dataCustomerApp.desc_app = this.dataCustomerApp.desc_app || "Test";
        this.citService.validateSCNumber(this.dataCustomerApp).subscribe(
            (res) => {
                if (res.success)
                    this.alertService.alert({
                        text: res.message,
                        type: AlertType.SUCCESS,
                        dismissable: true,
                    });
                else
                    this.alertService.alert({
                        text: res.message || 'Invalid SC Number!',
                        //title: 'No Access : ',
                        type: AlertType.DANGER,
                        dismissable: true,
                    });
            }, err => {
                console.log("err", err)
            })
    }

    scFormSubmit() {
        console.log(this.formJSONCustomerApp, this.formJSONTechnicalApp, this.formJSONUploadFormApp)
        this.submitted = true;
        let payload;
        let formUrl = 'create'; let invalidAnswer;
        var submitCode = (payload, formUrl, goto?) => {
            return this.citService.submitCode(payload, formUrl).subscribe(
                (res) => {
                    console.log('SC Form Save Response:', res);
                    let messageType = AlertType.DANGER;
                    if (res && res['success']) {
                        if (goto) {
                            return this.router.navigate(['/cit/file-manager'])
                        }
                        messageType = AlertType.SUCCESS;
                        if (this.current <= 1) this.current += 1;
                        if (this.current == 1) {
                            this.getForm("renderTechnicalForm", this.dataCustomerApp);
                        }
                        else if (this.current == 2)
                            this.getForm("renderUploadForm", this.dataTechnicalApp);
                    }
                    if (!goto || (res && !res['success']))
                        this.alertService.alert({
                            text: res['message'] || 'Issue with SC Form data!',
                            //title: 'No Access : ',
                            type: messageType,
                            dismissable: true,
                        });
                },
                (err) => {
                    this.alertService.alert({
                        text: err['message'] || 'Issue with SC Form data!',
                        //title: 'No Access : ',
                        type: AlertType.DANGER,
                        dismissable: true,
                    });
                    console.log('err', err);
                }
            );
        }

        if (this.current == 0 || this.current == 1) {
            if (this.current == 0) {
                invalidAnswer = this.isInvalidAnswer(this.formJSONCustomerApp, this.dataCustomerApp);
                payload = this.dataCustomerApp;
            }
            else if (this.current == 1) {
                formUrl = 'saveTechnicalForm';
                invalidAnswer = this.isInvalidAnswer(this.formJSONTechnicalApp, this.dataTechnicalApp,this.copyFormJSONTechnicalApp);
                this.copyFormJSONTechnicalApp.sc_num=this.dataCustomerApp.sc_num;
                // payload = this.dataTechnicalApp;
               // payload.sc_num = this.dataCustomerApp.sc_num;
            }
            if (invalidAnswer) {
                return this.alertService.alert({
                    text: invalidAnswer,
                    //title: 'No Access : ',
                    type: AlertType.DANGER,
                    dismissable: true,
                });
            }
            submitCode(this.current == 1 ? this.copyFormJSONTechnicalApp : payload, formUrl);
        } else if (this.current == 2) {
            formUrl = 'saveUploadForm';
            payload = new FormData();
            invalidAnswer = this.isInvalidAnswer(this.formJSONUploadFormApp, this.dataUploadFormApp);
            Object.keys(this.dataUploadFormApp).forEach((key) => {
                payload.append(key, (typeof this.dataUploadFormApp[key] === 'object' && key !== 'codeFile') ? JSON.stringify(this.dataUploadFormApp[key]) : this.dataUploadFormApp[key].rawFile);
            });
            payload.append("sc_num", this.dataCustomerApp.sc_num);
            payload.append("fileName", this.dataUploadFormApp["codeFile"].name);
            if (invalidAnswer) {
                return this.alertService.alert({
                    text: invalidAnswer,
                    //title: 'No Access : ',
                    type: AlertType.DANGER,
                    dismissable: true,
                });
            }
            this.commonModalService
                .confirm('Submit Code', 'Are you sure want to "Submit"?', 'Submit', 'Cancel', 'sm')
                .then((res) => {
                    submitCode(payload, formUrl, true)
                }, (err) => {
                    console.log('Cancel- ', err);
                });

        }

    }

    isInvalidAnswer(renderForm, formData, copyFormJSONTechnicalApp?) {
        let retObj;
        if (renderForm && renderForm.requestForm)
            renderForm.requestForm.forEach((ques, i) => {
                if (!retObj && ques.required && (ques._formControl.status === "INVALID") && !formData[ques.name])
                    retObj = ques.label + " is required";
                if (copyFormJSONTechnicalApp)
                    copyFormJSONTechnicalApp["requestForm"][i].value = formData[ques.name];
            });
        return retObj;
    }

    ngOnDestroy(): void { }

    ngAfterViewInit(): void { }
    copyFormJSONTechnicalApp: any;
    getForm(name, formData) {
        this.loadingService.showAlert();
        this.citService
            .postGenericData(this.restURL + name, formData)
            .subscribe((data) => {
                if (name === 'renderCustomerForm')
                    this.formJSONCustomerApp = data;
                else if (name === 'renderTechnicalForm') {
                    this.copyFormJSONTechnicalApp = JSON.parse(JSON.stringify(data));
                    this.formJSONTechnicalApp = data;
                }
                else if (name === 'renderUploadForm')
                    this.formJSONUploadFormApp = data;
                this.loading = false;
                this.loadingService.hideAlert();
            });
    }

    cancel() {
        if (this.current >= 1) {
            this.current -= 1;

            return;
        }
    }
}
