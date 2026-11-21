import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from './lib/actions/auth-actions'

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    console.log("Proxying request: ", request.url)

    const user = await getCurrentUser();

    if(!user) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
    matcher: ['/dashboard/:path*'],
}