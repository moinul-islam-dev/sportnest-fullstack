

import { getCurrentUser } from "@/lib/actions/auth-actions";
import { Booking } from "@/types/booking.type";
import MyBookingsClient from "../_components/MyBookingsClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const fetchBookings = async (token: string): Promise<Booking[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/facilities/booking`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const result = await res.json();

    return result.data || [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

const MyBookingsPage = async () => {

  const user = await getCurrentUser();

  if (!user) {
    return <p className="py-10 text-center">Please login to view your bookings.</p>;
  }

  const { token } = await auth.api.getToken({
    headers: await headers()
  })

  if(!token) {
    throw new Error("Unable to generate authentication token");
  }

 
  const bookings = await fetchBookings(token);

  return <MyBookingsClient initialBookings={bookings} />;
};

export default MyBookingsPage;
