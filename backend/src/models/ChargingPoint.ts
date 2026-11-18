import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ConnectorType =
  | 'Type 2 (AC)'
  | 'CCS 2 (DC Fast)'
  | 'CHAdeMO (DC)'
  | 'GB/T'
  | 'Tesla Destination';

export type ChargerStatus = 'available' | 'occupied' | 'maintenance';

export interface IChargingPoint extends Document {
  station: Types.ObjectId;
  identifier: string; // e.g. "Bay 01", "Charger-A"
  connectorType: ConnectorType;
  powerKw: number; // e.g. 50, 150, 350 kW
  pricingPerKwh: number;
  status: ChargerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const chargingPointSchema = new Schema<IChargingPoint>(
  {
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
      index: true,
    },
    identifier: {
      type: String,
      required: [true, 'Charging point identifier (e.g. Bay 1) is required'],
      trim: true,
    },
    connectorType: {
      type: String,
      enum: [
        'Type 2 (AC)',
        'CCS 2 (DC Fast)',
        'CHAdeMO (DC)',
        'GB/T',
        'Tesla Destination',
      ],
      required: [true, 'Connector type is required'],
    },
    powerKw: {
      type: Number,
      required: [true, 'Power in kW is required'],
      min: [1, 'Power must be at least 1 kW'],
    },
    pricingPerKwh: {
      type: Number,
      required: [true, 'Pricing per kWh is required'],
      min: [0, 'Pricing cannot be negative'],
      default: 0.35,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of identifier per station
chargingPointSchema.index({ station: 1, identifier: 1 }, { unique: true });

export const ChargingPoint: Model<IChargingPoint> =
  mongoose.models.ChargingPoint ||
  mongoose.model<IChargingPoint>('ChargingPoint', chargingPointSchema);
