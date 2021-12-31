import { Component, OnInit } from '@angular/core';
import { BreadcrumbItem, BreadcrumbItemHome, BreadcrumbIconRequest, BreadcrumbDescriptor,BreadcrumbItemPrecise } from '../../nav/breadcrumb-wrapper/breadcrumb-descriptor.type';
import { BreadcrumbService } from '../../nav/breadcrumb-wrapper/breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-device-family',
  templateUrl: './device-family.component.html',
  styleUrls: ['./device-family.component.scss']
})
export class DeviceFamilyComponent implements OnInit {
  dbFile: any = { fileName: 'H54J055P0_XX.catsincl' };
  customerInformation = {
    contactPerson: 'Phil Drake',
    phoneNumber: 'XXX-XXX-XXXX ',
    salesPerson: 'NA',
  };
  deviceinformation = {
    deviceName: '512K',
    scNumber: '107037',
    submitDate: 'Mon Aug 30 10:12:38 CDT. 2021',
  };
  fileHistory = {
    timeStamp: 'Mon Sept 6 10:12:38 CDT. 2021',
  };
  fileName = [
    { name: 'SC107037_N79P.P01-00.rcf' },
    { name: 'SC107037_n79p.p01-00.cvf' },
  ];
  dataBase = {
    test: ' rpchrome-rom 10.81.153.149 8538',
    rom: ' rpchrome-rom 10.81.153.149 8538',
  };
  otherDataBase = [
    { scNum: ' SC107037.mpu' },
    { scNum: ' SC107037_N79P.P01-00.rcf' },
    { scNum: ' SC107037_n79p.p01-00.cvf' },
  ];

  constructor(private route: ActivatedRoute, private router: Router, private breadcrumbService: BreadcrumbService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      let deviceFamily = (paramMap && paramMap["params"] && paramMap["params"].deviceFamily);
      const breadcrumbItem: BreadcrumbItem = {
        label: `Device Family #${deviceFamily || ''}`,
        icon: BreadcrumbIconRequest,
        routerLink: null,
      };
      this.breadcrumbService.setBreadcrumb(
        new BreadcrumbDescriptor(breadcrumbItem, [BreadcrumbItemHome,BreadcrumbItemPrecise])
      );
    });
  }
}
