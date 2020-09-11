import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFinalPriceComponent } from './add-final-price.component';

describe('AddFinalPriceComponent', () => {
  let component: AddFinalPriceComponent;
  let fixture: ComponentFixture<AddFinalPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFinalPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFinalPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
