import { BaseQuery } from './BaseQuery';

const GRANULARITY_TO_INTERVAL = {
  day: 'DD',
  week: 'W',
  hour: 'HH24',
  minute: 'mm',
  second: 'ss',
  month: 'MM',
  quarter: 'Q',
  year: 'YY'
};

export class VerticaQuery extends BaseQuery {
  public convertTz(field) {
    return `${field} AT TIME ZONE '${this.timezone}'`;
  }

  // eslint-disable-next-line no-unused-vars
  public timeStampParam(timeDimension) {
    return this.timeStampCast('?');
  }

  public timeGroupedColumn(granularity, dimension) {
    return `TRUNC(${dimension}, '${GRANULARITY_TO_INTERVAL[granularity]}')`;
  }
}
