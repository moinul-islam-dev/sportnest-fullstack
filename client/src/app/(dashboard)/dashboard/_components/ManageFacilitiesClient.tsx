"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2, MapPin, Users, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Facility } from "@/types/facility.type";

interface ManageFacilitiesClientProps {
    initialFacilities: Facility[];
}

const ManageFacilitiesClient = ({
    initialFacilities,
}: ManageFacilitiesClientProps) => {
    const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const router = useRouter();

    const handleDeleteFacility = async (facilityId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this facility? All associated bookings will also be deleted."
        );

        if (!confirmed) return;

        try {
            setDeletingId(facilityId);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/facilities/${facilityId}`,
                {
                    method: "DELETE",
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(
                    result.message || "Failed to delete facility"
                );
            }

            setFacilities((prev) =>
                prev.filter((facility) => facility._id !== facilityId)
            );

            toast.success("Facility deleted successfully!");

            router.refresh();

        } catch (error) {
            console.error("Error deleting facility:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {facilities.map((facility) => (
                <Card
                    key={facility._id}
                    className="overflow-hidden rounded-xl border-slate-100 bg-white shadow-xs"
                >
                    {/* Facility Image */}
                    <div className="relative h-52 w-full bg-slate-100">
                        {facility.imageUrl ? (
                            <Image
                                src={facility.imageUrl}
                                alt={facility.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-4xl">
                                🏟️
                            </div>
                        )}
                    </div>

                    <CardContent className="space-y-4 p-5">

                        {/* Facility Information */}
                        <div>
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {facility.name}
                                </h2>

                                <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                    {facility.sportType}
                                </span>
                            </div>

                            <div className="mt-3 space-y-2 text-sm text-slate-500">

                                <p className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    {facility.location}
                                </p>

                                <p className="flex items-center gap-2">
                                    <Users size={16} />
                                    Capacity: {facility.capacity}
                                </p>

                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Price per hour
                                </p>

                                <p className="text-lg font-bold text-slate-900">
                                    ৳{facility.pricePerHour}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/manage-facilities/${facility._id}/edit`
                                        )
                                    }
                                >
                                    <Pencil size={14} />
                                    Edit
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    disabled={deletingId === facility._id}
                                    onClick={() =>
                                        handleDeleteFacility(facility._id)
                                    }
                                >
                                    <Trash2 size={14} />

                                    {deletingId === facility._id
                                        ? "Deleting..."
                                        : "Delete"}
                                </Button>

                            </div>
                        </div>

                    </CardContent>
                </Card>
            ))}

        </div>
    );
};

export default ManageFacilitiesClient;