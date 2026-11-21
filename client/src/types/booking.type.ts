export interface Booking {
  _id: string;
  userID: string;
  userName: string;
  userEmail: string;
  facility: string;
  bookingDate: string;
  timeSlot: string;
  duration: number;
  totalPrice: number;
}