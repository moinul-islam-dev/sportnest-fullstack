
"use client";

import { useState } from "react";
import Link from "next/link";

import BookingCard from "../_components/BookingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/booking.type";
import toast from "react-hot-toast";

interface MyBookingsClientProps {
    initialBookings: Booking[];
}

const MyBookingsClient = ({
    initialBookings,
}: MyBookingsClientProps) => {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const handleCancelBooking = async (bookingId: string) => {
        try {
            setCancellingId(bookingId);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/facilities/booking/${bookingId}`,
                {
                    method: "DELETE",
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to cancel booking");
            }

            setBookings((prev) =>
                prev.filter((item) => item._id !== bookingId)
            );

            toast.success("Booking cancelled successfully!");

        } catch (error) {
            console.error("Error cancelling booking:", error);
            toast.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                    My Bookings
                </h1>

                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                    View and manage all your facility bookings
                </p>
            </div>

            {/* Empty State */}
            {bookings.length === 0 && (
                <Card className="rounded-2xl border border-zinc-200/70 bg-white py-0 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center px-4 py-20 text-center">
                        <span
                            role="img"
                            aria-label="Calendar"
                            className="mb-4 select-none text-4xl sm:text-5xl"
                        >
                            📅
                        </span>

                        <h2 className="text-base font-bold text-zinc-900 sm:text-lg">
                            No bookings yet
                        </h2>

                        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                            Start by exploring our facilities
                        </p>

                        <Button
                            className="mt-6 h-10 rounded-lg bg-[#16a34a] px-6 text-xs font-semibold text-white shadow-xs hover:bg-[#15803d] sm:text-sm"
                        >
                            <Link href="/facilities">
                                Browse Facilities
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Bookings List */}
            {bookings.length > 0 && (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking._id}
                            booking={booking}
                            onCancel={handleCancelBooking}
                            isCancelling={cancellingId === booking._id}
                        />
                    ))}
                </div>
            )}

        </section>
    );
};

export default MyBookingsClient;
