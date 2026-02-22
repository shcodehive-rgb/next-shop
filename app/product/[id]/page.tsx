import { redirect } from 'next/navigation';

// This route should never be hit directly since the middleware handles locale prefixing.
// Redirect to the default locale version as a safety net.
export default async function ProductRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/ar/product/${id}`);
}
