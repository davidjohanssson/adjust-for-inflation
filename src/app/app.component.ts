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
    amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    from: new FormControl<Moment | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    through: new FormControl<Moment | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
  });

  constructor() {
    moment.locale('sv');
    registerLocaleData(sv);
  }

  public setMonthAndYear(normalizedMonthAndYear: Moment, datepickerRef: MatDatepicker<Moment>, formControl: FormControl<Moment | null>) {
    const ctrlValue = this.formGroup.controls.from.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    formControl.setValue(ctrlValue);
    datepickerRef.close();
  }

  public handleSubmit() {

  }

  @HostListener('window:resize', ['$event'])
  handleResize() {
    this.isHandset = window.matchMedia('(max-width: 599px)').matches;
  }
}
