import { redirect } from "next/navigation";

export default function BookmarksRedirectPage() {
  // Bookmarks are part of the dashboard layout, so we redirect the top-level /bookmarks route to it
  redirect("/dashboard/bookmarks");
}
