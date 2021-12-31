import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceFamilyComponent } from './device-family.component';

describe('DeviceFamilyComponent', () => {
  let component: DeviceFamilyComponent;
  let fixture: ComponentFixture<DeviceFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceFamilyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
