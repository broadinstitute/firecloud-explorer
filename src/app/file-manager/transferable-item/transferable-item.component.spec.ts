import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferableItemComponent } from './transferable-item.component';

describe('TransferableItemComponent', () => {
  let component: TransferableItemComponent;
  let fixture: ComponentFixture<TransferableItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferableItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
