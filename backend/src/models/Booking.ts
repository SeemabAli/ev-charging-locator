import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IBooking extends Document {
  user: Types.ObjectId;
  station: Types.ObjectId;
  chargingPoint: Types.ObjectId;
  slot: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
      index: true,
    },
    chargingPoint: {
      type: Schema.Types.ObjectId,
      ref: 'ChargingPoint',
      required: [true, 'Charging point reference is required'],
      index: true,
    },
    slot: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot reference is required'],
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Database-level constraint: prevent duplicate active bookings for the same slot
bookingSchema.index(
  { slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
