"use client";

import { redirect } from "next/navigation";
import AdminBlogs from "@/components/admin/AdminBlogs";

export default function AdminBlogPage() {
    // Redirect to main admin page with blogs tab active
    redirect("/admin?tab=blogs");
    
    // Alternatively, you could render the component directly:
    // return <AdminBlogs />;
}
