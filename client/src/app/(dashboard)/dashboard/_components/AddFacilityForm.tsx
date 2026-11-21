"use client";

import React, { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CurrentUser } from "@/types/user.type";


export default function AddFacilityForm({ user }: { user: CurrentUser }) {

    const { id, email } = user;
    const userEmail = email;

    // _id: string;
    // name: string;
    // sportType: string;
    // imageUrl: string;
    // pricePerHour: number;
    // location: string;
    // capacity: number;
    // availableTimeRanges: {
    //     startTime: string;
    //     endTime: string;
    // } [];
    // description: string;

    const [formData, setFormData] = useState({
        userId: id,
        userEmail: email,
        name: "",
        sportType: "",
        imageUrl: "",
        location: "",
        pricePerHour: "",
        capacity: "",
        availableTimeRanges: [
            {
                startTime: "",
                endTime: "",
            },
        ],
        description: "",
    });

    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleAddSlot = () => {
        const { startTime, endTime } = formData.availableTimeRanges[
            formData.availableTimeRanges.length - 1
        ];

        if (!startTime || !endTime) {
            toast.error("Please select both start and end time");
            return;
        }

        if (startTime >= endTime) {
            toast.error("End time must be later than start time");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            availableTimeRanges: [
                ...prev.availableTimeRanges,
                {
                    startTime: "",
                    endTime: "",
                },
            ],
        }));
    };
    const handleRemoveSlot = (slotToRemove: string) => {
        setAvailableTimeSlots((prev) =>
            prev.filter((slot) => slot !== slotToRemove)
        );
    };

    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
    };


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            // Prepare facility data
            const { pricePerHour, capacity, availableTimeRanges, ...safeInputs } = formData;

            // Remove empty ranges
            const validTimeRanges = availableTimeRanges.filter(
                (range) => range.startTime && range.endTime
            );

            const facilityData = {
                ...safeInputs,
                pricePerHour: Number(pricePerHour),
                capacity: Number(capacity),
                availableTimeRanges: validTimeRanges,
            };

            // Basic validation
            if (validTimeRanges.length === 0) {
                toast.error("Please add at least one available time range");
                return;
            }

            // Validate time ranges
            const hasInvalidRange = validTimeRanges.some(
                (range) => range.startTime >= range.endTime
            );

            if (hasInvalidRange) {
                toast.error("End time must be later than start time");
                return;
            }

            // Validate overlapping ranges
            const sortedRanges = [...validTimeRanges].sort(
                (a, b) => a.startTime.localeCompare(b.startTime)
            );

            const hasOverlappingRanges = sortedRanges.some(
                (range, index) =>
                    index > 0 &&
                    range.startTime < sortedRanges[index - 1].endTime
            );

            if (hasOverlappingRanges) {
                toast.error("Available time ranges cannot overlap");
                return;
            }

            if (facilityData.pricePerHour <= 0 || facilityData.capacity < 1) {
                toast.error("Please provide valid price and capacity");
                return;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/facilities`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(facilityData),
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to create facility");
            }

            toast.success("Facility added successfully!");

            // Reset form
            setFormData({
                userId: id,
                userEmail: email,
                name: "",
                sportType: "",
                imageUrl: "",
                location: "",
                pricePerHour: "",
                capacity: "",
                availableTimeRanges: [
                    {
                        startTime: "",
                        endTime: "",
                    },
                ],
                description: "",
            });

            handleSuccess();

        } catch (error) {
            console.error("Error creating facility:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full p-6 lg:p-8">
            <div className="w-full max-w-5xl">
                {/* Form Card */}
                <form
                    onSubmit={onSubmit}
                    className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5"
                >
                    {/* Row 1: Facility Name & Sport Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="facilityName"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                FACILITY NAME *
                            </Label>
                            <Input
                                id="facilityName"
                                required
                                placeholder="e.g. Green Turf Football Ground"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="w-full h-10 rounded-lg border-slate-200 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="sportType"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                SPORT TYPE *
                            </Label>
                            <Select
                                value={formData.sportType}
                                onValueChange={(value) => handleChange("sportType", value ?? "")}
                            >
                                <SelectTrigger
                                    id="sportType"
                                    className="w-full h-10 rounded-lg border-slate-200 text-slate-800"
                                >
                                    <SelectValue placeholder="Select Sport Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Football">Football</SelectItem>
                                    <SelectItem value="Cricket">Cricket</SelectItem>
                                    <SelectItem value="Badminton">Badminton</SelectItem>
                                    <SelectItem value="Basketball">Basketball</SelectItem>
                                    <SelectItem value="Tennis">Tennis</SelectItem>
                                    <SelectItem value="Swimming">Swimming</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Image URL & Location */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="imageUrl"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                IMAGE URL *
                            </Label>
                            <Input
                                id="imageUrl"
                                type="url"
                                required
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={(e) => handleChange("imageUrl", e.target.value)}
                                className="w-full h-10 rounded-lg border-slate-200 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="location"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                LOCATION *
                            </Label>
                            <Input
                                id="location"
                                required
                                placeholder="e.g. Gulshan, Dhaka"
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                                className="w-full h-10 rounded-lg border-slate-200 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Row 3: Price Per Hour & Capacity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="pricePerHour"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                PRICE PER HOUR ($) *
                            </Label>
                            <Input
                                id="pricePerHour"
                                type="number"
                                min="0"
                                step="any"
                                required
                                placeholder="50"
                                value={formData.pricePerHour}
                                onChange={(e) => handleChange("pricePerHour", e.target.value)}
                                className="w-full h-10 rounded-lg border-slate-200 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="capacity"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                CAPACITY (PLAYERS) *
                            </Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                required
                                placeholder="22"
                                value={formData.capacity}
                                onChange={(e) => handleChange("capacity", e.target.value)}
                                className="w-full h-10 rounded-lg border-slate-200 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Row 4: Available Time Slots */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="timeSlots"
                            className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                        >
                            AVAILABLE TIME SLOTS *
                        </Label>
                        <div className="space-y-3">
                            {formData.availableTimeRanges.map((range, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        type="time"
                                        value={range.startTime}
                                        onChange={(e) => {
                                            const updatedRanges = [...formData.availableTimeRanges];

                                            updatedRanges[index] = {
                                                ...updatedRanges[index],
                                                startTime: e.target.value,
                                            };

                                            setFormData((prev) => ({
                                                ...prev,
                                                availableTimeRanges: updatedRanges,
                                            }));
                                        }}
                                        className="w-full h-10 rounded-lg border-slate-200"
                                    />

                                    <span className="text-slate-500">to</span>

                                    <Input
                                        type="time"
                                        value={range.endTime}
                                        onChange={(e) => {
                                            const updatedRanges = [...formData.availableTimeRanges];

                                            updatedRanges[index] = {
                                                ...updatedRanges[index],
                                                endTime: e.target.value,
                                            };

                                            setFormData((prev) => ({
                                                ...prev,
                                                availableTimeRanges: updatedRanges,
                                            }));
                                        }}
                                        className="w-full h-10 rounded-lg border-slate-200"
                                    />

                                    {formData.availableTimeRanges.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    availableTimeRanges: prev.availableTimeRanges.filter(
                                                        (_, i) => i !== index
                                                    ),
                                                }));
                                            }}
                                            variant="destructive"
                                            className="h-10 w-10 shrink-0 p-0"
                                            aria-label="Remove time range"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <Button
                                type="button"
                                onClick={handleAddSlot}
                                variant="outline"
                                className="w-full"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Time Range
                            </Button>
                        </div>

                        {availableTimeSlots.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                {availableTimeSlots.map((slot) => (
                                    <Badge
                                        key={slot}
                                        variant="secondary"
                                        className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200"
                                    >
                                        <span>{slot}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSlot(slot)}
                                            className="hover:text-red-600 focus:outline-none"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Row 5: Description */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="description"
                            className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                        >
                            DESCRIPTION *
                        </Label>
                        <Textarea
                            id="description"
                            required
                            rows={3}
                            placeholder="Describe your facility..."
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="w-full rounded-lg border-slate-200 placeholder:text-slate-400 resize-y"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-7 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-medium text-sm shadow-sm transition-colors"
                        >
                            {isLoading ? "Adding Facility..." : "Add Facility"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}