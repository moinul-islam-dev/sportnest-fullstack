"use client";

import React from "react";
import {
    CalendarDays,
    Clock3,
    Receipt,
    Trash2,
    Loader2,
    Building2,
    UserRound,
    Mail,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/booking.type";

interface BookingCardProps {
    booking: Booking;
    onCancel?: (id: string) => void;
    isCancelling?: boolean;
}

const BookingCard = ({
    booking,
    onCancel,
    isCancelling = false,
}: BookingCardProps) => {
    const formattedDate = new Date(
        `${booking.bookingDate}T00:00:00`
    ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <Card className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
            <CardContent className="p-0">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Building2 className="size-7" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900">
                                Facility Booking
                            </h3>

                            <p className="text-xs text-slate-500">
                                ID: #{booking._id.slice(-8)}
                            </p>
                        </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-700">
                        BOOKED
                    </span>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_175px]">

                    {/* Booking Details */}
                    <div className="min-w-0 space-y-3">

                       

                        {/* Booking Information */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

                            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                <CalendarDays className="size-8 shrink-0 text-emerald-600" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400">
                                        BOOKING DATE
                                    </p>

                                    <p className="mt-0.5 text-xs font-bold text-slate-800">
                                        {formattedDate}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                <Clock3 className="size-8 shrink-0 text-emerald-600" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400">
                                        TIME SLOT
                                    </p>

                                    <p className="mt-0.5 text-xs font-bold text-slate-800">
                                        {booking.timeSlot}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                <Receipt className="size-8 shrink-0 text-emerald-600" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400">
                                        DURATION
                                    </p>

                                    <p className="mt-0.5 text-xs font-bold text-slate-800">
                                        {booking.duration} Hours
                                    </p>
                                </div>
                            </div>

                        </div>

                        
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-row items-center justify-between gap-3 rounded-lg bg-emerald-50/70 p-3 lg:flex-col lg:items-stretch lg:justify-center">

                        <div>
                            <p className="text-xs font-medium text-slate-500">
                                Total Amount
                            </p>

                            <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-emerald-700">
                                ৳{booking.totalPrice.toLocaleString("en-BD")}
                            </p>

                            <p className="text-[10px] text-slate-500">
                                {booking.duration} hours booking
                            </p>
                        </div>

                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isCancelling}
                                onClick={() => onCancel(booking._id)}
                                className="h-9 shrink-0 border-rose-200 bg-white text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                {isCancelling ? (
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-1.5 size-4" />
                                )}

                                {isCancelling ? "Cancelling..." : "Cancel Booking"}
                            </Button>
                        )}

                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookingCard;