import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  orderId: string;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A ticket must have a title'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'A ticket must have a price']
    },
    userId: {
      type: String,
      required: [true, 'A ticket must be bought via a user']
    },
    orderId: {
      type: String
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

ticketschema.set('versionKey', 'version');
ticketschema.plugin(updateIfCurrentPlugin);

ticketschema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketschema);

export { Ticket };
