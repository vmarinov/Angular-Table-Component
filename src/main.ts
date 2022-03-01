import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { tableConfig } from './assets/tableConfig';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';


@Component({
  selector: 'data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'table.template.html',
  animations: [
    trigger('loadData', [
      state('loading', style({
        opacity: '0.2'
      })),
      state('ready', style({
        opacity: '1'
      })),
      transition('* => *', animate('0.5s'))
    ])
  ],
  host: { '(document:keydown)': 'navigate($event)' }
})
class DataTableComponent implements OnInit {
  @Input() class: string = '';
  @Input() rows: number = 0;
  @Input() columns: any[] = [];
  @Input() canSelect: boolean = false;
  @Input() rowClassFn: Function = () => { };
  @Input() selectedRowClass: string = '';
  @Input() dataFunction: Function = () => { };
  @Input() showHeader: boolean = true;
  @Input() formatFns: any;
  @Input() tableConfig: any;
  @Input() trackFn: any;

  @Output() lineSelected: EventEmitter<any> = new EventEmitter();
  @Output() selectedRows: EventEmitter<any> = new EventEmitter();

  tableData: any;
  isSelected: boolean = false;
  selectedLine: any;
  firstRow: number = 0;
  prevDisabled: boolean = true;
  nextDisabled: boolean = false;
  currPage: number = 1;
  isLastPage: boolean = false;
  maxRows!: number;
  rowId: any;
  rowsSelected = new Set();
  allSelected: boolean = false;
  isIndeterminate: boolean = false;
  loadData: boolean = false;

  tableFormat: any = {
    'num': this.formatNum,
    'int': this.formatInt,
    'currency': this.formatCurrency,
    'date': this.formatDate,
    'time': this.formatTime,
    'percent': this.formatPercent,
    'tax': this.formatTax,
  }

  constructor(private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    let fullData = this.dataFunction(0, Infinity);
    fullData.then((res: any[]) => this.maxRows = res.length);
    //let data = this.dataFunction(this.firstRow, this.rows);
    this.simulateDataDelay();
    for (let col of this.columns) {
      this.initColumn(col);
    }
    // data.then((res: any[]) => {
    //   console.log(res);
    //   this.tableData = res;
    //   this.changeRef.detectChanges();
    // })
    //   .catch(console.error);

    // for (let col of this.columns) {
    //   this.initColumn(col);
    // }
  }

  unwrapData(): void {
    let data = this.dataFunction(this.firstRow, this.rows);
    if (!(data instanceof Promise)) {
      data = Promise.resolve(data);
    }
    data.then((res: any[]) => {
      this.tableData = res;
      this.changeRef.detectChanges();
    }).catch(console.error);
  }

  initColumn(col: any) {
    col.valueFn = col.property instanceof Function ?
      col.property :
      (data: any) => data[col.property];

    if (col.formatFn) {
      col.textFn = col.formatFn;
      return;
    }

    if (col.format) {
      let [format, param] = col.format.split(':');
      let txtFn = this.tableFormat[format] || this.formatFns[format];
      col.textFn = (value: any) => txtFn(value, param);
    } else {
      col.textFn = (value: any) => value;
    }
  }

  prepareValue(data: any, col: any) {
    let value = col.valueFn(data);
    return col.textFn(value);
  }

  nextPage() {
    this.rowId = null;
    this.firstRow += this.rows;
    // this.unwrapData();
    this.simulateDataDelay();
    this.currPage++;
    this.rowsSelected.clear();
    this.isIndeterminate = false;
    this.prevDisabled = false;
    this.checkLastPage();
  }

  prevPage() {
    this.rowId = null;
    let pos = this.firstRow - this.rows;
    this.firstRow = pos > 0 ? pos : 0;
    this.currPage--;
    this.rowsSelected.clear();
    this.isIndeterminate = false;
    // this.unwrapData();
    this.simulateDataDelay();
    if (this.currPage == 1) {
      this.prevDisabled = true;
    }
    this.nextDisabled = false;
  }

  checkLastPage() {
    let dataRows = this.dataFunction(this.firstRow + this.rows, this.rows);
    if (!(dataRows instanceof Promise)) {
      dataRows = Promise.resolve(dataRows);
    }
    dataRows.then((res: any[]) => {
      if (res.length == 0) {
        this.nextDisabled = true;
        this.changeRef.detectChanges();
      }
    }).catch(console.error);
  }

  onSelected(line: any, rowId: any) {
    if (!this.canSelect) {
      return;
    }

    this.rowId = rowId;
    this.changeSelection(rowId);
    this.lineSelected.emit(line);
    this.selectedRows.emit(this.rowsSelected);
  }

  changeSelection(rowId: number) {
    if (this.rowsSelected.has(rowId)) {
      this.rowsSelected.delete(rowId);
      this.allSelected = false;
      this.isIndeterminate = this.rowsSelected.size > 0;
      return;
    }

    this.rowsSelected.add(rowId);
    this.allSelected = this.rowsSelected.size == this.tableData.length;
    this.isIndeterminate = !this.allSelected && this.rowsSelected.size > 0;
    this.selectedRows.emit(this.rowsSelected);
  }

  selectAll(event: any) {
    if (this.isIndeterminate) {
      this.rowsSelected.clear();
      this.isIndeterminate = false;
      this.allSelected = false;
      event.target.checked = false;
      return;
    }

    if (this.allSelected) {
      this.rowsSelected.clear();
      this.allSelected = false;
      return;
    }

    for (let i = 0; i < this.tableData.length; i++) {
      this.rowsSelected.add(i);
    }
    this.allSelected = true;
    this.selectedRows.emit(this.rowsSelected);
  }

  deleteRows() {
    let startIdx = this.rowsSelected.values().next().value;
    let deleteCount = this.rowsSelected.size;
    let nextRows = this.firstRow + this.rows;
    let tableData = this.tableData.filter((k: any, idx: any) => !this.rowsSelected.has(idx));
    let data = this.dataFunction(nextRows + startIdx, deleteCount);
    data.then((res: any) => {
      this.tableData = tableData.concat(res);
      this.changeRef.detectChanges();
    });
    this.rowsSelected.clear();
    this.isIndeterminate = false;
  }

  formatNum(value: any) {
    return Number(value).toFixed(2);
  }

  formatInt(value: any) {
    return Number(value).toFixed(0);
  }

  formatCurrency(value: any, currency: any) {
    const CURRENCY_SYMBOLS: any = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'BGN': 'лв.'
    };

    switch (currency) {
      case 'BGN':
        return `${Number(value).toFixed(2)} ${CURRENCY_SYMBOLS[currency]}`;
      default:
        return `${CURRENCY_SYMBOLS[currency]} ${Number(value).toFixed(2)}`;
    }
  }

  formatDate(value: any, param: any) {
    let date = new Date(value);
    return param == 'long' ? date.toString() : date.toDateString();
  }

  formatTime(value: any) {
    return new Date(value).getTime();
  }

  formatPercent(value: any) {
    return `${value} %`;
  }

  formatTax(value: any, param: any) {
    return value * 100 / param;
  }

  navigate(event: any) {
    switch (event.key) {
      case 'ArrowDown':
        if (this.rowId != null) {
          this.navigateDown();
        }
        break;
      case 'ArrowUp':
        if (this.rowId != null) {
          this.navigateUp();
        }
        break;
      case 'PageUp':
        if (!this.nextDisabled) {
          this.nextPage()
        }
        break;
      case 'PageDown':
        if (this.currPage > 1) {
          this.prevPage();
        }
        break;
      case 'Home':
        this.navigateHome();
        break;
      case 'End':
        this.navigateEnd();
        break;
      default:
        break;
    }
  }

  navigateHome() {
    this.currPage = 1;
    this.firstRow = 0;
    this.nextDisabled = false;
    this.prevDisabled = true;
    this.rowsSelected.clear();
    this.unwrapData();
  }

  navigateEnd() {
    this.nextDisabled = true;
    this.prevDisabled = false;
    this.currPage = Math.ceil(this.maxRows / this.rows);
    this.firstRow = this.maxRows - this.rows;
    this.rowsSelected.clear();
    this.unwrapData();
  }

  navigateUp() {
    if (this.rowId - 1 < 0) {
      return;
    }
    this.rowId--;
  }

  navigateDown() {
    if (this.rowId >= this.rows - 1) {
      return;
    }
    this.rowId++;
  }

  simulateDataDelay() {
    this.loadData = true;
    setTimeout((_: any) => {
      this.tableData = this.dataFunction(this.firstRow, this.rows);
      this.changeRef.markForCheck();
      this.loadData = false;
    }, 500);
  }
}

@Component({
  selector: 'app',
  template: `
    <div class="container">
      <data-table
        [rows]="6"
        [class]="'table'"
        [dataFunction]="tableDataFunction"
        [columns]="tableColumns"
        [rowClassFn]="getRowClass"
        [selectedRowClass]="selectedRowClass"
        [showHeader]="showHeader"
        [canSelect]="canSelect"
        [formatFns]="format"
        [tableConfig]="tableConfig"
        [trackFn]="trackFn"
        (lineSelected)="lineSelected($event)"
        (selectedRows)="rowsSelected($event)">
      </data-table>
    </div>
  `
})
class AppComponent {
  tableConfig = tableConfig;
  tableColumns: any[] = this.tableConfig.columns;
  tableDataFunction: Function;
  showHeader: boolean = tableConfig.showHeader;
  canSelect: boolean = tableConfig.canSelect;
  format = tableConfig.format;
  selectedRowClass = tableConfig.selectedRowClass;
  trackFn: Function;
  selectedRows: any;


  constructor() {
    this.tableDataFunction = this.asyncData.bind(this);
    this.trackFn = this.identifyRow.bind(this);
  }

  lineSelected(line: any) {
    let text = `
      You've selected row with data:
      First Name: ${line['first-name']}
      Last Name: ${line['last-name']}
      Age: ${line['age']}
      City: ${line['city']}
      Payment: ${line['payment']}
      Certified: ${line['has-certificate']}
    `;

    window.alert(text);
  }

  getRowClass(line: any) {
    let status = line.status
    return status == undefined ? 'unfinished' :
      status == 0 ? 'invalid' : ''
  }

  rowsSelected(rows: any) {
    this.selectedRows = rows;
  }

  async asyncData(pos: number, count: number) {
    return fetch('/assets/personData.json')
      .then(res => res.json())
      .then(data => {
        return data.slice(pos, pos + count);
      })
      .catch(console.error);
  }

  identifyRow(index: any, item: any) {
    return item['first-name'];
  }
}

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule],
  declarations: [
    AppComponent,
    DataTableComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule);