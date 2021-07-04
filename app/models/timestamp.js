import Model, { attr } from '@ember-data/model';

export default class TimestampModel extends Model {
  @attr('string') time;
}
