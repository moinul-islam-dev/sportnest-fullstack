
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, MapPin, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

const FacilityNotFound = () => {
    return (
        <main className="flex min-h-[75vh] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-lg rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-10">

                    {/* Illustration */}
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                        <SearchX
                            size={40}
                            className="text-green-600"
                            strokeWidth={1.7}
                        />
                    </div>

                    {/* Error Code */}
                    <p className="text-sm font-bold tracking-[0.2em] text-green-600">
                        404 ERROR
                    </p>

                    {/* Heading */}
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                        Facility Not Found
                    </h1>

                    {/* Description */}
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                        Sorry, this facility is no longer available.
                        It may have been removed by the administrator
                        or the link you followed may be incorrect.
                    </p>

                    {/* Info */}
                    <div className="mt-6 flex w-full items-start gap-3 rounded-xl bg-slate-50 p-4 text-left">
                        <MapPin
                            size={19}
                            className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <p className="text-xs leading-5 text-slate-600 sm:text-sm">
                            Don't worry! You can explore our other
                            available sports facilities and find
                            another place to play.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">

                        <Button className="h-11 flex-1 rounded-lg bg-green-600 p-0 font-semibold text-white hover:bg-green-700">
                            <Link
                                href="/facilities"
                                className="flex h-full w-full items-center justify-center gap-2 px-4"
                            >
                                <SearchX className="h-4 w-4" />
                                <span>Browse Facilities</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-11 flex-1 rounded-lg font-semibold"
                        >
                            <Link href="/"
                                className="flex h-full w-full items-center justify-center gap-2 px-4">
                                <Home size={16} />
                                Back to Home
                            </Link>
                        </Button>

                    </div>

                    {/* Back Link */}
                    <Link
                        href="/facilities"
                        className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-green-600"
                    >
                        <ArrowLeft size={14} />
                        Explore other facilities
                    </Link>

                </CardContent>
            </Card>
        </main>
    );
};

export default FacilityNotFound;
