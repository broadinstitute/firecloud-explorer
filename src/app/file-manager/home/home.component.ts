import { Component, OnInit, ViewChild } from '@angular/core';
import { ANIMATE_ON_ROUTE_ENTER } from '@app/core';
import { TransferablesGridComponent } from '../transferables-grid/transferables-grid.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  animateOnRouteEnter = ANIMATE_ON_ROUTE_ENTER;
  @ViewChild(TransferablesGridComponent) transferablesGridComponent: TransferablesGridComponent;

  selectedFiles = 0;
  index = 0;
  display = false;

  constructor() { }

  ngOnInit() {
  }

  changeTab(tab: number) {
    this.index = null;
    this.index = tab;
  }

}
