import { Component, HostListener } from '@angular/core';
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

  constructor(private http: HttpClient) {
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
    const amount = this.formGroup.controls.amount.value!;
    const from = this.formGroup.controls.from.value!;
    const through = this.formGroup.controls.through.value!;

    if (amount <= 0) {
      this.formGroup.controls.amount.setErrors({ 'amountNegative': 'Ange ett positivt belopp' });
      return;
    }


  }

  @HostListener('window:resize', ['$event'])
  handleResize() {
    this.isHandset = window.matchMedia('(max-width: 599px)').matches;
  }
}
