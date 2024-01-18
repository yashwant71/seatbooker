import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { Seat } from '../shared/models/Seats';
import { RESEED_URL, SEAT_BOOK_URL, SEAT_GET_URL } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Seat[]> {
    return this.http.get<Seat[]>(SEAT_GET_URL);
  }

  update(seatCount: number) {
    return this.http.get<any>(SEAT_BOOK_URL + '/' + seatCount);
  }

  reseed(){
    return this.http.get<any>(RESEED_URL);
  }
}
