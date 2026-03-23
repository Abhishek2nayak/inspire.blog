"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing,
  className,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const newFollowing = !following;
    setFollowing(newFollowing);

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast({
        title: newFollowing ? "Following" : "Unfollowed",
        description: newFollowing
          ? "You'll see their posts in your feed."
          : "Removed from your following list.",
      });
    } catch {
      setFollowing(!newFollowing);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (session?.user && (session.user as { id: string }).id === userId) {
    return null;
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "rounded-full h-8 px-4 text-xs font-medium transition-all",
        following
          ? "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
          : "bg-foreground text-background hover:opacity-90 border-0",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : following ? (
        <>
          <UserCheck className="h-3 w-3 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3 w-3 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
