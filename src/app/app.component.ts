import { Component, ElementRef, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import moment from 'moment';
import sv from '@angular/common/locales/sv';
import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type Calculation = {
  amount: number;
  from: Moment;
  through: Moment
  result: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
		FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isHandset = window.matchMedia('(max-width: 599px)').matches;
  public minDate = moment('1980-01-01');
  public maxDate = moment().subtract(2, 'months');
	public amount: number | null = null;
	public from: Moment | null = null;
	public through: Moment | null = null;
  public calculation: Calculation | null = null;

  constructor(
    private http: HttpClient,
    private elementRef: ElementRef<HTMLElement>
  ) {
    moment.locale('sv');
    registerLocaleData(sv);
  }

  public openDatepicker(event: Event, datepickerRef: MatDatepicker<Moment>) {
    event.preventDefault();
    datepickerRef.open();
  }

  public setFromMonthAndYear(normalizedMonthAndYear: Moment, datepickerRef: MatDatepicker<Moment>) {
		this.from = moment(normalizedMonthAndYear);

		if (this.through !== null) {
			if (this.from > this.through) {
				this.through = moment(this.from);
			}
		}

    datepickerRef.close();
  }

  public setThroughMonthAndYear(normalizedMonthAndYear: Moment, datepickerRef: MatDatepicker<Moment>) {
		this.through = moment(normalizedMonthAndYear);

		if (this.from !== null) {
			if (this.through < this.from) {
				this.from = moment(this.through);
			}
		}

    datepickerRef.close();
  }

	public isFormValid(form: NgForm) {
		if (form.invalid) {
			return false;
		}

		if (this.amount === null) {
			return false;
		}

		if (this.amount === 0) {
			return false;
		}

		if (this.from === null) {
			return false;
		}

		if (this.through === null) {
			return false;
		}

		return true;
	}

  public handleSubmit() {
    this.calculation = null;

    const amount = this.amount!;
    const from = this.from!;
    const through = this.through!;

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
