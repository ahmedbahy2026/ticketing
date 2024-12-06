import { OrderStatus } from '@bahy_tickets/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketDoc } from './ticket';

interface orderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface orderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface orderModel extends mongoose.Model<orderDoc> {
  build(attrs: orderAttrs): orderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'An order must created by a user']
    },
    status: {
      type: String,
      required: [true, 'An order must have a status'],
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: orderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<orderDoc, orderModel>('Order', orderSchema);

export { Order };
