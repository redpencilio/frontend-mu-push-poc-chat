import Model, { attr } from '@ember-data/model';

export default class MessageModel extends Model {
  @attr('string') text;
  @attr('string') from;
  @attr('string') to;
  @attr('string') time;
}
