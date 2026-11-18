import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type StationStatus = 'pending' | 'approved' | 'rejected';

export interface IStation extends Document {
  name: string;
  operator: Types.ObjectId;
  description: string;
  address: string;
  city: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  operatingHours: {
    open: string; // e.g. "06:00"
    close: string; // e.g. "23:00"
  };
  amenities: string[];
  status: StationStatus;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const stationSchema = new Schema<IStation>(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      maxlength: [100, 'Station name cannot exceed 100 characters'],
    },
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Station operator is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Station physical address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (val: number[]) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 && // longitude
              val[1] >= -90 &&
              val[1] <= 90 // latitude
            );
          },
          message: 'Invalid GeoJSON coordinates: [longitude (-180..180), latitude (-90..90)]',
        },
      },
    },
    operatingHours: {
      open: { type: String, default: '00:00' },
      close: { type: String, default: '23:59' },
    },
    amenities: {
      type: [String],
      default: ['Restrooms', 'Café', 'WiFi'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON 2dsphere index for location-based nearby queries
stationSchema.index({ location: '2dsphere' });

export const Station: Model<IStation> =
  mongoose.models.Station || mongoose.model<IStation>('Station', stationSchema);
