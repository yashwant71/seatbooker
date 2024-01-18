import { environment } from "src/environments/environment";

const BASE_URL = environment.production? '' : 'http://localhost:5000';

export const SEAT_GET_URL = BASE_URL + '/api/seats';
export const SEAT_BOOK_URL = BASE_URL + '/api/seatbook';
export const RESEED_URL = BASE_URL + '/api/reseed';

