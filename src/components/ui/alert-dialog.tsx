"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface AlertDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
    return (
        <>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        open,
                        onOpenChange,
                    });
                }
                return child;
            })}
        </>
    );
};

interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const AlertDialogContent = React.forwardRef<
    HTMLDivElement,
    AlertDialogContentProps
>(({ className, open, onOpenChange, children, ...props }, ref) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/80 animate-in fade-in duration-200"
                onClick={() => onOpenChange?.(false)}
            />

            {/* Content */}
            <div
                ref={ref}
                className={cn(
                    "relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg animate-in zoom-in-95 duration-200 sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold text-zinc-950", className)}
        {...props}
    />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-zinc-500", className)}
        {...props}
    />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    AlertDialogActionProps
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(buttonVariants(), className)}
        {...props}
    />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    AlertDialogActionProps
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-2 sm:mt-0",
            className
        )}
        {...props}
    />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
