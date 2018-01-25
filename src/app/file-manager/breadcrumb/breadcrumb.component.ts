import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  segments: any[] = [];
  readonly DELIMITER = '/';

  @Input('path') set setPath(path: string) {
    this.processPath(path);
  }

  @Output('home') home: EventEmitter<any> = new EventEmitter();
  @Output('change') change: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  stepClicked(evt, segment) {
    this.change.emit(segment);
  }

  homeClicked(evt) {
    this.home.emit('home');
  }

  private processPath(fullpath: string) {
    if (fullpath === null || fullpath === undefined) { return; }
    fullpath = fullpath.substring(fullpath.length - 1, fullpath.length) === this.DELIMITER
               ? fullpath.substr(0, fullpath.lastIndexOf(this.DELIMITER)) : fullpath;
    const segs = fullpath.split(this.DELIMITER);
    this.segments = [];
    let p = '';
    segs.forEach(s => {
      p = p + s;
      const e = {
        label: s,
        path: p
      };
      if (e.path !== '') {
        this.segments.push(e);
      }
    });
  }
}
