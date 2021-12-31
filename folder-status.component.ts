import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    AfterViewInit,
} from '@angular/core';
import { PageChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { CitService } from '../cit.service';
import { AppConstant } from '../../app-constant.constant';
import { CommonModalService } from '../../common/common-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewContentComponent } from '../view-content/view-content.component';

import {
    filterBy,
    FilterDescriptor,
    CompositeFilterDescriptor,
    distinct,
} from '@progress/kendo-data-query';

@Component({
    selector: 'app-folder-status',
    templateUrl: './folder-status.component.html',
    styleUrls: ['./folder-status.component.scss'],
})
export class FolderStatusComponent implements OnInit {
    public gridView: GridDataResult;
    private items: any[];
    private filteredItems: any[];

    pagerTypes = ['numeric', 'input'];
    pageable = AppConstant.grid.pageable;
    pageSize = 5;
    skip = 0;

    constructor(
        private citService: CitService,
        private commonModalService: CommonModalService,
        private modalService: NgbModal
    ) {}
    ngOnInit() {
        this.getFolderStatus();
    }
    getFolderStatus() {
        this.citService
            .getFolderStatus({ sc_num: '123456' })
            .subscribe((res) => {
                this.items = res;
                this.loadItems(this.items);
            });
    }

    public filter: CompositeFilterDescriptor;
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.filteredItems = filterBy(this.items, filter);
        this.loadItems(this.filteredItems);
    }
    public distinctPrimitive(fieldName: string): any {
        return distinct(this.items, fieldName).map((item) => item[fieldName]);
    }

    pageChange({ skip, take }: PageChangeEvent): void {
        this.skip = skip;
        this.pageSize = take;
        this.loadItems(this.filteredItems);
    }
    onFilter(searchText) {
        this.filteredItems = this.items.filter(
            (rec) =>
                rec.mpuFiles.indexOf(searchText) != -1 ||
                rec.portNumber.indexOf(searchText) != -1
        );
        this.loadItems(this.filteredItems);
    }
    private loadItems(filteredData): void {
        this.gridView = {
            data: filteredData.slice(this.skip, this.skip + this.pageSize),
            total: filteredData.length,
        };
        // gridView
    }
    approveOrReject(status, dataItem, askStatus) {
        this.commonModalService
            .confirm(
                askStatus,
                `Are you sure want to "${askStatus}"?`,
                'Approve',
                'Cancel',
                'sm'
            )
            .then(
                (res) => {
                    dataItem.fileStatus = status;
                },
                (err) => {
                    console.log('Cancel- ', err);
                    dataItem.approveOrReject = null;
                }
            );
    }
    approveOrReject1(status, dataItem, askStatus) {
        this.commonModalService
            .confirm(
                askStatus,
                `Are you sure want to "${askStatus}"?`,
                'Resubmit',
                'Cancel',
                'sm'
            )
            .then(
                (res) => {
                    dataItem.fileStatus = status;
                },
                (err) => {
                    console.log('Cancel- ', err);
                    dataItem.approveOrReject1 = null;
                }
            );
    }
    showFile(fileName) {
        const modalRef = this.modalService.open(ViewContentComponent, {
            size: 'lg',
            windowClass: 'modal-job-scrollable',
        });
        modalRef.componentInstance.fileName = fileName;
        modalRef.componentInstance.message = 'Meesage';
    }
}
