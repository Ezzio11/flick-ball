import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== process.env.REVALIDATION_TOKEN) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    try {
        // 1. Revalidate the Fetch Cache (Data)
        // revalidateTag('matches'); // Disabled due to build error, using revalidatePath instead

        // 2. Revalidate Specific Pages (ISR)
        // We revalidate the paths that use the data
        revalidatePath('/', 'layout'); // Home and everything under it
        revalidatePath('/squad', 'layout');
        revalidatePath('/team', 'layout');
        revalidatePath('/matches', 'layout');

        console.log("Revalidation triggered successfully via API");

        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
    }
}
