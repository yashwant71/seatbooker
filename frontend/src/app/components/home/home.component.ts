import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SeatService } from 'src/app/services/seat.service';
import { Seat } from 'src/app/shared/models/Seats';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

  @Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })
export class HomeComponent implements OnInit {
  seats: Seat[] = [];
  bookingForm: FormGroup;
  constructor(private seatService: SeatService, private formBuilder: FormBuilder) {
    let seatsObservable:Observable<Seat[]>;
    seatsObservable = this.seatService.getAll()
    seatsObservable.subscribe((serverSeats) => {
      this.seats = serverSeats;
    });

    this.bookingForm = this.formBuilder.group({
      seatCount: ['', [Validators.required, Validators.min(1), Validators.max(7)]]
    });
  }
  get seatCountControl(): AbstractControl<number> | null {
    return this.bookingForm.get('seatCount');
  }
  book(){
    const control = this.seatCountControl;
    if (control && control.valid) {
      // Your booking logic goes here
      const seatCount = control.value;
      console.log(`Booking ${seatCount} seats`);
      let seatsObservable:Observable<any>
      seatsObservable = this.seatService.update(seatCount)
      seatsObservable.subscribe((serverSeats) => {
        console.log(serverSeats)
        try{
          // Update corresponding seats in this.seats with the new information
          if(serverSeats.success){
            // making existing "booked now" to "booked"
            this.seats.forEach((currSeat) => {
              if(currSeat.bookednow){
                currSeat.booked = true;
                delete currSeat.bookednow;
              }
            })
            // adding bookednow to newly booked seats
            this.seats.forEach((localSeat) => {
              const matchingSeat = serverSeats.seats.find((serverSeat:Seat) => serverSeat.seatNumber === localSeat.seatNumber);

              if (matchingSeat) {
                // Update local seat with information from serverSeat
                localSeat.bookednow = true;
              }
            });
          }else{
            alert(serverSeats.message)
          }
        }catch(err){
          alert(err)
        }
      });

    } else {
      // Handle invalid form state or null control
      alert('Please enter a valid number between 1 and 7.');
    }
  }


  reseed(){
    let seatsObservable:Observable<Seat[]>;
    seatsObservable = this.seatService.reseed()
    seatsObservable.subscribe((serverSeats) => {
      this.seats = serverSeats;
    });

  }
  ngOnInit(): void {
  }

}
