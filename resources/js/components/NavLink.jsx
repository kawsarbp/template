import { Link, usePage } from "@inertiajs/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const NavLink = forwardRef(
  ({ className, activeClassName, to, href, ...props }, ref) => {
    const { url } = usePage();
    const destination = href || to;
    
    if (!destination) {
        return <span className={className} ref={ref} {...props} />
    }

    // Normalize paths to ignore query strings for comparison if needed
    // However, strict equality on url (which includes query) is sometimes desired
    // For navigation links, usually we check path.
    const currentPath = url.split("?")[0];
    const destPath = destination.split("?")[0];
    
    const isActive = currentPath === destPath || (destPath !== "/" && destPath.length > 1 && currentPath.startsWith(destPath));

    return (
      <Link
        ref={ref}
        href={destination}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };