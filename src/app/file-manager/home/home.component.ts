import { Component, OnInit } from '@angular/core';
import { ANIMATE_ON_ROUTE_ENTER } from '@app/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  animateOnRouteEnter = ANIMATE_ON_ROUTE_ENTER;

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
