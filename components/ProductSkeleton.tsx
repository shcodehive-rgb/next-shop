export default function ProductSkeleton() {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-square bg-gray-200" />

            {/* Content Placeholder */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="mt-auto h-10 bg-gray-200 rounded-2xl w-full" />
            </div>
        </div>
    );
}
