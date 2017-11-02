import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferablesGridComponent } from './transferables-grid.component';

describe('TransferablesGridComponent', () => {
  let component: TransferablesGridComponent;
  let fixture: ComponentFixture<TransferablesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferablesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferablesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
