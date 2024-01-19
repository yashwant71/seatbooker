import dotenv from "dotenv";
dotenv.config();
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import { dbConnect } from "./configs/database.config";
import asyncHandler from "express-async-handler";
import { Seat, SeatModal } from "./models/seat.model";
import { seedseats } from "./data";
dbConnect();

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200","http://localhost:5000"],
  })
);

app.get(
  "/seed",
  asyncHandler(async (req, res) => {
    const usersCount = await SeatModal.countDocuments();
    if (usersCount > 0) {
      res.send("Seed is already done!");
      return;
    }

    await SeatModal.create(seedseats);
    res.send("Seed Is Done!");
  })
);

app.get(
  "/api/reseed",
  asyncHandler(async (req, res) => {
    try {
      // Deleting all documents in the SeatModal collection
      await SeatModal.deleteMany({});

      // Seeding the collection again
      const seats = await SeatModal.create(seedseats);

      res.send(seats);
    } catch (error) {
      console.error("Error during reseed:", error);
      res.status(500).send("Error during reseed");
    }
  })
);

app.get(
  "/api/seats",
  asyncHandler(async (req, res) => {
    const seats = await SeatModal.find({}).sort({ seatNumber: 1 })
    res.send(seats);
  })
);

app.get('/api/seatbook/:seatCount', asyncHandler( async (req:any, res) => {
  const seatCount = parseInt(req.params.seatCount);
  const seats = await SeatModal.find({}).sort({ seatNumber: 1 })
  let seatsToBook: Seat[] | any[] = [];

  // booking seats in a row
  const findSeatsInRow = () => {
    // Grouping seats into rows of 7
    const rows = [];
    for (let i = 0; i < seats.length; i += 7) {
      rows.push(seats.slice(i, i + 7));
    }

    let mostSeatsInARow : Seat[] | any[] = [];
    let mostSeatsInARowIndex = 0;
    
    // Find the first row with enough available seats
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const availableSeats = row.filter(seat => !seat.booked);
      // storing most available seats in a row and index
      if(availableSeats.length > mostSeatsInARow.length){
        mostSeatsInARow = availableSeats;
        mostSeatsInARowIndex = i;
      } 
      if (availableSeats.length >= seatCount) {
        seatsToBook = availableSeats.slice(0, seatCount);
        break;
      }
    }

    // if we not able to find in a single row , finding lower nearset 
    for(let i = mostSeatsInARowIndex; i < rows.length; i++){
      const row = rows[i];
      const availableSeats = row.filter(seat => !seat.booked);
      for(let j = 0; j <availableSeats.length;j++){
        if(seatsToBook.length < seatCount){
          seatsToBook.push(availableSeats[j])
        }else{
          break;
        }
      }
    }
    
    // if we not able to find in a single row , finding upper nearset 
    for(let i = 0; i <= mostSeatsInARowIndex; i++){
      const row = rows[i];
      const availableSeats = row.filter(seat => !seat.booked);
      for(let j = 0; j <availableSeats.length;j++){
        if(seatsToBook.length < seatCount){
          seatsToBook.push(availableSeats[j])
        }else{
          break;
        }
      }
    }
    return seatsToBook
  }

  seatsToBook = findSeatsInRow();
  // Function to book seats
  const bookSeats = async (seatsToBook: Seat[]) => {
    const updatePromises = seatsToBook.map((seat) => {
      return SeatModal.findByIdAndUpdate(seat.id, { booked: true });
    });
  
    // Waiting for all updates to be completed
    await Promise.all(updatePromises);
  };
  
  if (seatsToBook && seatsToBook.length === seatCount) {
    // Booking the found seats
    bookSeats(seatsToBook)
      .then(() => {
        res.send({ success: true, seats: seatsToBook });
      })
      .catch((error) => {
        res.status(500).send({ success: false, message: 'Error updating seats.', error });
      });
  } else {
    res.send({ success: false, message: 'No available seats found.' });
  }
}))

app.use(express.static("public"));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'))
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Website served on http://localhost:" + port);
});
