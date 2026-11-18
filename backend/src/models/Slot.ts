import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISlot extends Document {
  chargingPoint: Types.ObjectId;
  station: Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "09:00")
  endTime: string; // HH:mm (e.g. "10:00")
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const slotSchema = new Schema<ISlot>(
  {
    chargingPoint: {
      type: Schema.Types.ObjectId,
      ref: 'ChargingPoint',
      required: [true, 'Charging point reference is required'],
      index: true,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Slot date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be HH:mm (24hr)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:mm)'],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be HH:mm (24hr)'],
    },
    isBooked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: A charging point cannot have duplicate slots at the same time
slotSchema.index({ chargingPoint: 1, date: 1, startTime: 1 }, { unique: true });

export const Slot: Model<ISlot> =
  mongoose.models.Slot || mongoose.model<ISlot>('Slot', slotSchema);
