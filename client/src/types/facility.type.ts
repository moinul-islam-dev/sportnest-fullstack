// export interface Facility {
//   _id: string;
//   name: string;
//   sportType: string;
//   imageUrl: string;
//   location: string;
//   pricePerHour: number;
//   capacity: number;
//   availableTimeSlots: string[];
//   description: string;
// }

export interface Facility {
  _id: string;
  name: string;
  sportType: string;
  imageUrl: string;
  pricePerHour: number;
  location: string;
  capacity: number;
  availableTimeRanges: {
    startTime: string;
    endTime: string;
  }[];
  description: string;
}