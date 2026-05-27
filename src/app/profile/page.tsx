import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function ProfileIndexPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Redirect to the current user's actual profile page (which is located at /profile/[id])
  redirect(`/profile/${user.id}`);
}
