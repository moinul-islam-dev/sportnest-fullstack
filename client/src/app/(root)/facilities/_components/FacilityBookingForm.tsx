
"use client";

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Facility } from '@/types/facility.type';
import { Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CurrentUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface ExistingBooking {
    _id: string;
    startTime: string;
    endTime: string;
}

const FacilityBookingForm = ({
    facility,
    user
}: {
    facility: Facility;
    user: CurrentUser;
}) => {

    const { availableTimeRanges } = facility;

    const [formData, setFormData] = useState({
        userID: user.id,
        userName: user.name,
        userEmail: user.email,
        facility: facility._id,
        bookingDate: "",
        startTime: "",
        duration: "1",
    });

    const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Convert HH:mm into minutes
    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);

        return hours * 60 + minutes;
    };

    // Convert minutes into HH:mm
    const minutesToTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
    };

    // Fetch existing bookings whenever booking date changes
    useEffect(() => {

        if (!formData.bookingDate) {
            setExistingBookings([]);
            setLoadingBookings(false);
            return;
        }

        const controller = new AbortController();

        const fetchExistingBookings = async () => {

            try {

                setLoadingBookings(true);

                const result = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/facilities/${facility._id}/bookings?bookingDate=${formData.bookingDate}`,
                    {
                        cache: "no-store",
                        signal: controller.signal
                    }
                );

                const data = await result.json();

                if (!result.ok) {
                    throw new Error(data.message || "Failed to fetch existing bookings");
                }

                setExistingBookings(data.data ?? []);

            } catch (error) {

                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }

                console.error("Fetch bookings error:", error);

                setExistingBookings([]);

                toast.error("Failed to load available booking times.");

            } finally {

                if (!controller.signal.aborted) {
                    setLoadingBookings(false);
                }
            }
        };

        fetchExistingBookings();

        return () => controller.abort();

    }, [facility._id, formData.bookingDate]);

    // Filter available slots based on existing bookings
    const availableTimeSlots = availableTimeRanges.filter((range) => {

        const slotStart = timeToMinutes(range.startTime);
        const slotEnd = timeToMinutes(range.endTime);

        const isBooked = existingBookings.some((booking) => {

            const bookedStart = timeToMinutes(booking.startTime);
            const bookedEnd = timeToMinutes(booking.endTime);

            return slotStart < bookedEnd && slotEnd > bookedStart;
        });

        return !isBooked;
    });

    // Find selected time range
    const selectedRange = availableTimeRanges.find(
        (range) => range.startTime === formData.startTime
    );

    // Calculate maximum possible duration
    const maxDuration = (() => {

        if (!selectedRange || !formData.startTime) return 0;

        const startMinutes = timeToMinutes(formData.startTime);

        let availableUntil = timeToMinutes(selectedRange.endTime);

        // Find the next booking within the selected slot
        existingBookings.forEach((booking) => {

            const bookedStart = timeToMinutes(booking.startTime);

            if (bookedStart > startMinutes) {
                availableUntil = Math.min(availableUntil, bookedStart);
            }
        });

        const availableMinutes = availableUntil - startMinutes;

        return Math.floor(availableMinutes / 30) * 0.5;

    })();

    // Calculate end time
    const calculateEndTime = () => {

        if (!formData.startTime || !formData.duration) return "";

        const endMinutes =
            timeToMinutes(formData.startTime) +
            Number(formData.duration) * 60;

        return minutesToTime(endMinutes);
    };

    const endTime = calculateEndTime();

    // Calculate total price
    const totalPrice = facility.pricePerHour * Number(formData.duration);

    // Handle input changes
    const handleChange = (field: keyof typeof formData, value: string) => {

        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // Reset selected slot when booking date changes
    const handleDateChange = (value: string) => {

        setFormData((prev) => ({
            ...prev,
            bookingDate: value,
            startTime: "",
            duration: "1"
        }));

        setExistingBookings([]);
    };

    // Handle time slot selection
    const handleStartTimeChange = (value: string) => {

        const selectedRange = availableTimeRanges.find(
            (range) => range.startTime === value
        );

        if (!selectedRange) return;

        const startMinutes = timeToMinutes(selectedRange.startTime);
        const rangeEnd = timeToMinutes(selectedRange.endTime);

        let availableUntil = rangeEnd;

        existingBookings.forEach((booking) => {

            const bookedStart = timeToMinutes(booking.startTime);

            if (bookedStart > startMinutes) {
                availableUntil = Math.min(availableUntil, bookedStart);
            }
        });

        const calculatedMaxDuration =
            Math.floor((availableUntil - startMinutes) / 30) * 0.5;

        setFormData((prev) => ({
            ...prev,
            startTime: value,
            duration: calculatedMaxDuration >= 1 ? "1" : "0.5"
        }));
    };

    // Handle booking submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        if (submitting) return;

        const { bookingDate, startTime, duration } = formData;

        // Required field validation
        if (!bookingDate || !startTime || !duration) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (loadingBookings) {
            toast.error("Please wait while available times are loading.");
            return;
        }

        const selectedDuration = Number(duration);

        // Duration validation
        if (
            !Number.isFinite(selectedDuration) ||
            selectedDuration < 0.5 ||
            selectedDuration > maxDuration ||
            selectedDuration * 2 !== Math.floor(selectedDuration * 2)
        ) {
            toast.error(`Duration must be between 0.5 and ${maxDuration} hours.`);
            return;
        }

        // Validate selected time range
        if (!selectedRange || !endTime) {
            toast.error("Please select a valid time slot.");
            return;
        }

        if (timeToMinutes(endTime) > timeToMinutes(selectedRange.endTime)) {
            toast.error("Booking cannot exceed selected time slot.");
            return;
        }

        // Final frontend overlap check
        const hasConflict = existingBookings.some((booking) => {

            const bookedStart = timeToMinutes(booking.startTime);
            const bookedEnd = timeToMinutes(booking.endTime);

            const newStart = timeToMinutes(startTime);
            const newEnd = timeToMinutes(endTime);

            return newStart < bookedEnd && newEnd > bookedStart;
        });

        if (hasConflict) {
            toast.error("This time slot has already been booked.");
            return;
        }

        try {

            setSubmitting(true);

            const facilityBookingData = {
                ...formData,
                duration: selectedDuration,
                endTime,
                totalPrice
            };

            const result = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/facilities/booking`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(facilityBookingData)
                }
            );

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message || "Booking failed");
            }

            if (data.success) {

                toast.success("Facility booked successfully!");

                setFormData((prev) => ({
                    ...prev,
                    bookingDate: "",
                    startTime: "",
                    duration: "1"
                }));

                setExistingBookings([]);
            }

        } catch (err) {

            console.error("Booking error:", err);

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to book facility!"
            );

        } finally {
            setSubmitting(false);
        }
    };

    // Local date for date input's minimum value
    const today = (() => {

        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    })();

    return (
        <CardContent className="p-0">
            <form className="space-y-4" onSubmit={onSubmit}>

                {/* Facility Name */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="facility"
                        className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                        FACILITY
                    </Label>

                    <Input
                        id="facility"
                        defaultValue={facility.name}
                        readOnly
                        className="w-full h-10 rounded-lg border-slate-200 bg-slate-50/70 text-slate-700 font-medium focus-visible:ring-0 cursor-default"
                    />
                </div>

                {/* Booking Date */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="bookingDate"
                        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>BOOKING DATE</span>
                    </Label>

                    <Input
                        id="bookingDate"
                        type="date"
                        min={today}
                        value={formData.bookingDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full h-10 rounded-lg border-slate-200 text-slate-800"
                    />
                </div>

                {/* Time Slot */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="timeSlot"
                        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>TIME SLOT</span>
                    </Label>

                    <Select
                        value={formData.startTime}
                        onValueChange={(value) => handleStartTimeChange(value ?? "")}
                        disabled={!formData.bookingDate || loadingBookings}
                    >
                        <SelectTrigger
                            id="timeSlot"
                            className="w-full h-10 rounded-lg border-slate-200 text-slate-800"
                        >
                            <SelectValue
                                placeholder={
                                    loadingBookings
                                        ? "Loading available slots..."
                                        : !formData.bookingDate
                                            ? "Select a booking date"
                                            : "Select a time slot"
                                }
                            />
                        </SelectTrigger>

                        <SelectContent>
                            {availableTimeSlots.length === 0 ? (
                                <SelectItem value="unavailable" disabled>
                                    No available time slots
                                </SelectItem>
                            ) : (
                                availableTimeSlots.map((range) => (
                                    <SelectItem
                                        key={`${range.startTime}-${range.endTime}`}
                                        value={range.startTime}
                                    >
                                        {range.startTime} - {range.endTime}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Duration (Hours) */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="duration"
                        className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    >
                        DURATION (HOURS)
                    </Label>

                    <Input
                        id="duration"
                        type="number"
                        min={0.5}
                        max={maxDuration}
                        step={0.5}
                        value={formData.duration}
                        onChange={(e) => handleChange("duration", e.target.value)}
                        disabled={!formData.startTime || maxDuration < 0.5}
                        className="w-full h-10 rounded-lg border-slate-200 text-slate-800"
                    />

                    {selectedRange && (
                        <p className="text-xs text-slate-500">
                            Maximum duration: {maxDuration} hour(s)
                        </p>
                    )}
                </div>

                {/* Price Summary Box */}
                <div className="rounded-xl bg-[#eefbf3] border border-[#d6f5e3] p-4 mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>৳{facility.pricePerHour}/hr &times; {formData.duration} hr</span>
                        <span>৳{totalPrice}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                            Total Price
                        </span>

                        <span className="text-base font-bold text-[#16a34a]">
                            ৳{totalPrice}
                        </span>
                    </div>
                </div>

                {/* Confirm Booking Button */}
                <Button
                    type="submit"
                    disabled={submitting || loadingBookings}
                    className="w-full h-11 mt-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold shadow-sm transition-colors"
                >
                    {submitting ? "Booking..." : "Confirm Booking"}
                </Button>

            </form>
        </CardContent>
    );
};

export default FacilityBookingForm;
