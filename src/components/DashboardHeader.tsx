"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKindeAuth, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { ModeToggle } from "@/components/ModeToggle";

export default function Header() {
  const { user, isAuthenticated } = useKindeAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-2 sm:px-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <h1 className="font-semibold text-sm sm:text-base lg:text-lg truncate">
          JobSchedule - Job Search Assistant
        </h1>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.picture || ""} alt={user?.given_name || ""} />
                <AvatarFallback>
                  {user?.given_name?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.given_name} {user?.family_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutLink 
                className="flex w-full cursor-pointer items-center"
                post_logout_redirect_url={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </LogoutLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
