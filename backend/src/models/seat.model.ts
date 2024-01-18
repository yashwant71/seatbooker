import {Schema, model} from 'mongoose';

export interface Seat{
    id:string;
    seatNumber:number;
    booked :boolean;
}

export const SeatSchema = new Schema<Seat>({
    seatNumber: {type: Number, required: true, unique: true},
    booked: {type: Boolean, required: true},
}, {
    timestamps: true,
    toJSON:{
        virtuals: true
    },
    toObject:{
        virtuals: true
    }
});

export const SeatModal = model<Seat>('seat', SeatSchema);