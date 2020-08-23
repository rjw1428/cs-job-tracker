import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardDiscountComponent } from './award-discount.component';

describe('AwardDiscountComponent', () => {
  let component: AwardDiscountComponent;
  let fixture: ComponentFixture<AwardDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardDiscountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
