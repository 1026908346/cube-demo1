import R from 'ramda';

export class BaseGroupFilter {
  constructor(filter) {
    this.values = filter.values;
    this.operator = filter.operator;
    this.measure = filter.measure;
    this.dimension = filter.dimension;
  }

  conditionSql(column) {
    return `(\n${this.values.map(f => f.conditionSql(column)).join(` ${this.operator.toUpperCase()} `)}\n)`;
  }

  filterToWhere() {
    const r = this.values.map(f => {
      const sql = f.filterToWhere();
      if (!sql) {
        return null;
      }
      return `(${sql})`;
    }).filter(R.identity).join(` ${this.operator} `);

    if (!r.length) {
      return null;
    }
    return r;
  }

  filterParams() {
    return this.values.map(f => f.filterParams());
  }

  getMembers() {
    return this.values.map(f => {
      if (f.getMembers) {
        return f.getMembers();
      }
      return f;
    });
  }
}
