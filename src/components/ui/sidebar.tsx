
'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean | undefined;
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarViewContext = React.createContext<'expanded' | 'collapsed'>('expanded');
const useSidebarView = () => React.useContext(SidebarViewContext);


export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobileHookValue = useIsMobile();
  const [_open, _setOpenInternal] = React.useState(defaultOpen); // Initial state based on defaultOpen

  // Effect to sync with cookie and openProp *after* mount
  React.useEffect(() => {
    // Handle controlled component scenario
    if (openProp !== undefined) {
      if (openProp !== _open) { // Check if internal state needs to align with prop
         _setOpenInternal(openProp);
      }
      // If controlled, cookie updates are managed by the controlling component via onOpenChange
      return;
    }

    // Handle uncontrolled component with cookie
    if (typeof window !== "undefined") {
      const cookieValueString = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split("=")[1];

      if (cookieValueString) {
        const cookieValueBoolean = cookieValueString === "true";
        if (_open !== cookieValueBoolean) { // Only update if different from current/default
          _setOpenInternal(cookieValueBoolean);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProp, defaultOpen]); // Rerun if defaultOpen or openProp changes

  const open = openProp !== undefined ? openProp : _open;

  const setOpen = React.useCallback(
    (value: boolean | ((prevState: boolean) => boolean)) => {
      const newOpenState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(newOpenState); // Call prop if controlled
      } else {
        _setOpenInternal(newOpenState); // Update internal state if uncontrolled
        if (typeof window !== "undefined") { // Update cookie only if uncontrolled
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        }
      }
    },
    [open, setOpenProp] // Removed _setOpenInternal from deps as it's stable
  );


  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    if (isMobileHookValue === undefined) return;
    return isMobileHookValue
      ? setOpenMobile((current) => !current)
      : setOpen((current) => !current)
  }, [isMobileHookValue, setOpen, setOpenMobile]);

  React.useEffect(() => {
    if (isMobileHookValue === undefined) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [toggleSidebar, isMobileHookValue]);

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      isMobile: isMobileHookValue,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobileHookValue, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}
SidebarProvider.displayName = "SidebarProvider"


const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, open } = useSidebar();

    if (isMobile === undefined && collapsible !== "none") {
      return null;
    }
    
    const currentCollapsibleMode = isMobile ? "offcanvas" : collapsible;
    const currentViewMode = open ? "expanded" : "collapsed";


    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground",
            "fixed top-14 h-[calc(100vh-3.5rem)] z-30",
            side === "left" ? "left-0 border-r" : "right-0 border-l",
            className
          )}
          ref={ref}
          {...props}
        >
           <SidebarViewContext.Provider value="expanded">
            {children}
          </SidebarViewContext.Provider>
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[var(--sidebar-width-mobile)] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            side={side}
            {...props}
          >
            <div className="flex h-full w-full flex-col">
              <SidebarViewContext.Provider value="expanded"> {/* Mobile always expanded view */}
                {children}
              </SidebarViewContext.Provider>
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop
    const isIconCollapsible = currentCollapsibleMode === 'icon';

    // Placeholder is always there to affect AppLayout's flex behavior
    const placeholderWidthClass = currentViewMode === "expanded"
      ? "w-[var(--sidebar-width)]"
      : isIconCollapsible
        ? "w-[var(--sidebar-width-icon)]"
        : "w-0"; // Offcanvas (desktop) placeholder is 0 when collapsed

    // Panel styling
    const panelWidthClass = currentViewMode === "expanded"
        ? "w-[var(--sidebar-width)]"
        : isIconCollapsible
            ? "w-[var(--sidebar-width-icon)]"
            : "w-[var(--sidebar-width)]"; // Offcanvas keeps width but translates

    const panelTransformClass = (currentViewMode === "collapsed" && currentCollapsibleMode === "offcanvas")
        ? (side === "left" ? "-translate-x-full" : "translate-x-full")
        : "";

    return (
      // This div acts as the placeholder by taking up space in the layout flow.
      // It also serves as the positioning context for the fixed visual panel if needed, though the panel is fixed to viewport.
      <div
        ref={ref}
        className={cn(
            "group peer hidden md:block text-sidebar-foreground",
            placeholderWidthClass,
            "transition-[width] duration-200 ease-linear relative h-full", // Removed top-14 h-[calc(100vh-3.5rem)]
            className
        )}
        data-state={currentViewMode}
        data-collapsible={currentCollapsibleMode} // Use resolved collapsible mode
        data-variant={variant}
        data-side={side}
        {...props}
      >
        {/* Actual visual sidebar panel, fixed positioning */}
        <div
          className={cn(
            "fixed z-30 flex flex-col bg-sidebar transition-[width,transform] duration-200 ease-linear",
            "top-14 h-[calc(100vh-3.5rem)]", // Positioned below header
            panelWidthClass,
            panelTransformClass,
            side === "left" ? "left-0" : "right-0",
            (variant === "floating" || variant === "inset") && "p-2",
            (variant === "floating" || variant === "inset") && currentViewMode === "collapsed" && isIconCollapsible
              ? "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" // Adjust for padding if floating/inset and icon
              : "",
            (variant !== "floating" && variant !== "inset") && (side === "left" ? "border-r" : "border-l"), // Border for non-floating/inset
            (variant === "floating" || variant === "inset") && "group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          )}
        >
          <SidebarViewContext.Provider value={currentViewMode}>
            {children}
          </SidebarViewContext.Provider>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 bg-background h-full overflow-y-auto min-h-0",
        "px-4 sm:px-6 lg:px-8 py-8",
        "max-w-screen-2xl mx-auto w-full",
        // No longer adjusting padding based on peer state here
        // The placeholder in Sidebar handles the width adjustment for content flow
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode: propViewMode, ...props }, ref) => {
  const contextViewMode = useSidebarView();
  const currentViewMode = propViewMode || contextViewMode;
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode: currentViewMode })
          : child
      )}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode: propViewMode, ...props }, ref) => {
  const contextViewMode = useSidebarView();
  const currentViewMode = propViewMode || contextViewMode;
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode: currentViewMode })
          : child
      )}
    </div>
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode: propViewMode, ...props }, ref) => {
  const contextSidebarViewMode = useSidebarView();
  const currentViewMode = propViewMode || contextSidebarViewMode;

  return (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn(
      "flex min-h-0 flex-1 flex-col gap-2 overflow-auto",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode: currentViewMode })
          : child
      )}
  </div>
)})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode: propViewMode, ...props }, ref) => {
  const contextSidebarViewMode = useSidebarView();
  const currentViewMode = propViewMode || contextSidebarViewMode;
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode: currentViewMode })
          : child
      )}
    </div>
  )
})
SidebarGroup.displayName = "SidebarGroup"


const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const viewMode = useSidebarView();

  if (viewMode === 'collapsed') {
    return null;
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const viewMode = useSidebarView();

  if (viewMode === 'collapsed') {
    return null;
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode: propViewMode, ...props }, ref) => {
  const contextSidebarViewMode = useSidebarView();
  const currentViewMode = propViewMode || contextSidebarViewMode;
  return (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  >
    {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode: currentViewMode })
          : child
      )}
  </div>
)})
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  >
    {React.Children.map(children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode })
        : child
    )}
  </ul>
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li"> & { sidebarViewMode?: 'expanded' | 'collapsed' }
>(({ className, children, sidebarViewMode: propViewMode, ...props }, ref) => {
  const contextViewMode = useSidebarView();
  const currentViewMode = propViewMode || contextViewMode;
  const isCollapsed = currentViewMode === 'collapsed';

  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn(
        "group/menu-item relative",
        isCollapsed && "flex justify-center",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { sidebarViewMode: currentViewMode })
          : child
      )}
    </li>
  )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
    sidebarViewMode?: 'expanded' | 'collapsed'
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children, // These are the original children passed to SidebarMenuButton
      sidebarViewMode: propSidebarViewMode,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile } = useSidebar();
    const contextSidebarViewMode = useSidebarView();

    const currentViewMode = propSidebarViewMode || contextSidebarViewMode;
    const isCollapsed = currentViewMode === 'collapsed';

    const finalButtonClasses = cn(
      sidebarMenuButtonVariants({ variant, size, className }),
      isCollapsed && "!size-8 !p-0 flex items-center justify-center" // Collapsed specific: 2rem square, no padding, flex center
    );

    let childrenToRender: React.ReactNode;

    if (asChild && React.isValidElement(children)) {
      // If asChild, children is the <Link> component.
      // We need to modify the children *of the Link component*.
      const linkElement = children as React.ReactElement<any>;
      const modifiedLinkChildren: React.ReactNode[] = [];
      React.Children.forEach(linkElement.props.children, (grandChild) => {
        if (React.isValidElement(grandChild)) {
          if (isCollapsed && grandChild.type === 'span') {
            // Omit span if collapsed
          } else {
            modifiedLinkChildren.push(grandChild); // Keep icon or other elements
          }
        } else {
          modifiedLinkChildren.push(grandChild); // Keep text nodes if any (shouldn't be for Link)
        }
      });
      // Clone the Link element with its modified children
      childrenToRender = React.cloneElement(linkElement, { children: modifiedLinkChildren });
    } else {
      // If not asChild, children are direct Icon and Span.
      const directChildrenArray: React.ReactNode[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          if (isCollapsed && child.type === 'span') {
            // Omit span if collapsed
          } else {
            directChildrenArray.push(child); // Keep icon
          }
        } else {
           directChildrenArray.push(child);
        }
      });
      childrenToRender = directChildrenArray;
    }
    
    const buttonElement = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={finalButtonClasses}
        {...props}
      >
        {childrenToRender}
      </Comp>
    );

    if (!tooltip) {
      return buttonElement;
    }

    let tooltipProps: React.ComponentProps<typeof TooltipContent> = {};
    if (typeof tooltip === "string") {
      tooltipProps.children = tooltip;
    } else {
      tooltipProps = tooltip;
    }
    
    const showTooltip = isCollapsed && (isMobile === false);


    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        {showTooltip && (
          <TooltipContent
            side="right"
            align="center"
            {...tooltipProps}
          />
        )}
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const viewMode = useSidebarView();

  if (viewMode === 'collapsed') {
    return null;
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const viewMode = useSidebarView();
  if (viewMode === 'collapsed') {
    return null;
  }
 return (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      className
    )}
    {...props}
  />
 )})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const viewMode = useSidebarView();
  if (viewMode === 'collapsed') {
    return null;
  }
  return (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      className
    )}
    {...props}
  />
)})
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  const viewMode = useSidebarView();
  if (viewMode === 'collapsed') {
    return null;
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
};

