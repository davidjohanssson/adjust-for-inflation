import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';
import sv from '@angular/common/locales/sv';
import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Calculation {
  amount: number;
  from: Moment;
  through: Moment
  result: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isHandset = window.matchMedia('(max-width: 599px)').matches;
  public minDate = moment('1980-01-01');
  public maxDate = moment().subtract(2, 'months');
  public formGroup = new FormGroup({
    amount: new FormControl<number | null>(null, { validators: [Validators.required] }),
    from: new FormControl<Moment | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    through: new FormControl<Moment | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
  });
  @ViewChild('resultRef') resultRef: ElementRef<HTMLDivElement> | undefined;
  public calculation: Calculation | null = null;

  constructor(
    private http: HttpClient,
    private elementRef: ElementRef<HTMLElement>
  ) {
    moment.locale('sv');
    registerLocaleData(sv);
  }

  public setFromMonthAndYear(normalizedMonthAndYear: Moment, datepickerRef: MatDatepicker<Moment>) {
    const ctrlValue = this.formGroup.controls.from.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.formGroup.controls.from.setValue(ctrlValue);

    if (this.formGroup.controls.through.value !== null) {
      if (ctrlValue > this.formGroup.controls.through.value) {
        this.formGroup.controls.through.setValue(ctrlValue);
      }
    }

    datepickerRef.close();
  }

  public setThroughMonthAndYear(normalizedMonthAndYear: Moment, datepickerRef: MatDatepicker<Moment>) {
    const ctrlValue = this.formGroup.controls.through.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.formGroup.controls.through.setValue(ctrlValue);

    if (this.formGroup.controls.from.value !== null) {
      if (ctrlValue < this.formGroup.controls.from.value) {
        this.formGroup.controls.from.setValue(ctrlValue);
      }
    }

    datepickerRef.close();
  }

  public handleSubmit() {
    this.calculation = null;

    const amount = this.formGroup.controls.amount.value!;
    const from = this.formGroup.controls.from.value!;
    const through = this.formGroup.controls.through.value!;

    if (amount <= 0) {
      this.formGroup.controls.amount.setErrors({ 'amountNegative': 'Ange ett positivt belopp' });
      return;
    }

    const body = {
      query: [
        {
          code: "ContentsCode",
          selection: {
            filter: "item",
            values: [
              "000004VU"
            ]
          }
        },
        {
          code: "Tid",
          selection: {
            filter: "item",
            values: [
              `${from.format('YYYY')}M${from.format('MM')}`,
              `${through.format('YYYY')}M${through.format('MM')}`
            ]
          }
        }
      ],
      response: {
        format: "json"
      }

    };

    this.http
      .post('https://api.scb.se/OV0104/v1/doris/sv/ssd/START/PR/PR0101/PR0101A/KPItotM', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
      .subscribe((response: any) => {
        const throughCpi = response.data.at(1).values.at(0);
        const fromCpi = response.data.at(0).values.at(0);

        this.calculation = {
          amount: amount,
          from: from,
          through: through,
          result: Math.round(amount * (throughCpi / fromCpi))
        };

        this.formGroup.markAsPristine();

        setTimeout(() => {
          this.elementRef.nativeElement.scrollTo({
            top: this.elementRef.nativeElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 1);
      });
  }

  @HostListener('window:resize', ['$event'])
  handleResize() {
    this.isHandset = window.matchMedia('(max-width: 599px)').matches;
  }
}
