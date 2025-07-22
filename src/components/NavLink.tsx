import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  label: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  route: string;
  pathname: string;
}

function NavLink({ label, Icon, route, pathname }: NavLinkProps) {
  const isActive =
    route === pathname || pathname.startsWith(`${route}/dashboard`);
  
  // Handle external links and placeholder routes
  const isExternalLink = route.startsWith('http');
  const isPlaceholder = route === '#';
  
  if (isPlaceholder) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="navlink opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-center">
            <p>{label}</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  if (isExternalLink) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={route}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("navlink", {
              "border-b-2 border-black dark:border-white": isActive,
            })}
          >
            <Icon
              className={cn("h-5 w-5", {
                "text-black dark:text-white": isActive,
              })}
            />
            <span className="sr-only">{label}</span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={route}
          className={cn("navlink", {
            "border-b-2 border-black dark:border-white": isActive,
          })}
        >
          <Icon
            className={cn("h-5 w-5", {
              "text-black dark:text-white": isActive,
            })}
          />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export default NavLink;
