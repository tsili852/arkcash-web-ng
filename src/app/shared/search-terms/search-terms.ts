export class SearchTerms {
  dateFrom: Date;
  dateTo: Date;
  amountFrom: number;
  amountTo: number;
  text: string;
  exportees: boolean;

  constructor(dateFrom: Date, dateTo: Date, amountFrom: number, amountTo: number, text: string, exportees: boolean) {
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.amountFrom = amountFrom;
    this.amountTo = amountTo;
    this.text = text;
    this.exportees = exportees;
  }
}
