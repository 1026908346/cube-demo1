import * as stream from 'stream';
import { getEnv } from '@cubejs-backend/shared';

export class QueryStream extends stream.Transform {
  private timeout = 5 * 60000 || getEnv('dbQueryTimeout');

  private timer = null;

  public queryKey: string;

  public streams: Map<string, stream.Stream>;

  public aliasNameToMember: { [alias: string]: string };

  public counter = 0;

  /**
   * @constructor
   */
  public constructor({
    key,
    streams,
    aliasNameToMember,
  }: {
    key: string;
    streams: Map<string, stream.Stream>;
    aliasNameToMember: { [alias: string]: string } | null;
  }) {
    super({
      objectMode: true,
      highWaterMark: getEnv('dbQueryStreamHighWaterMark'),
    });
    this.queryKey = key;
    this.streams = streams;
    this.aliasNameToMember = aliasNameToMember;
    this.debounce();
  }

  /**
   * @override
   */
  public _transform(chunk, encoding, callback) {
    if (this.streams.has(this.queryKey)) {
      this.streams.delete(this.queryKey);
    }
    let row = {};
    if (this.aliasNameToMember) {
      Object.keys(chunk).forEach((alias) => {
        row[this.aliasNameToMember[alias]] = chunk[alias];
      });
    } else {
      row = chunk;
    }
    if (this.counter < this.readableHighWaterMark) {
      this.counter++;
    } else {
      this.counter = 0;
      this.debounce();
    }
    callback(null, row);
  }

  /**
   * @override
   */
  public _destroy(error, callback) {
    clearTimeout(this.timer);
    if (this.streams.has(this.queryKey)) {
      this.streams.delete(this.queryKey);
    }
    callback(error);
  }

  /**
   * Reset destroyer timeout.
   */
  public debounce() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.destroy();
    }, this.timeout);
  }
}
