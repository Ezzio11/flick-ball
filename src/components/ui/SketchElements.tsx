"use client";

import { cn } from "@/lib/utils";
import React from "react";

/* ===== NOTEBOOK PAGE WRAPPER ===== */
interface NotebookPageProps {
    children: React.ReactNode;
    className?: string;
    variant?: "lined" | "grid" | "plain";
    showMargin?: boolean;
}

export function NotebookPage({
    children,
    className,
    variant = "grid",
    showMargin = false,
}: NotebookPageProps) {
    return (
        <section
            className={cn(
                "relative min-h-screen",
                variant === "lined" && "notebook-paper",
                variant === "grid" && "notebook-grid",
                variant === "plain" && "bg-[--notebook-bg]",
                !showMargin && "[&::before]:hidden",
                className
            )}
        >
            {children}
        </section>
    );
}

/* ===== COACH ARROW ===== */
interface CoachArrowProps {
    className?: string;
    direction?: "right" | "left" | "up" | "down" | "diagonal";
    size?: "sm" | "md" | "lg";
    color?: "primary" | "secondary" | "accent";
}

export function CoachArrow({
    className,
    direction = "right",
    size = "md",
    color = "primary",
}: CoachArrowProps) {
    const sizeMap = { sm: 40, md: 60, lg: 100 };
    const colorMap = {
        primary: "var(--ink-primary)",
        secondary: "var(--ink-secondary)",
        accent: "var(--ink-accent)",
    };

    const rotationMap = {
        right: 0,
        down: 90,
        left: 180,
        up: 270,
        diagonal: -45,
    };

    const s = sizeMap[size];

    return (
        <svg
            width={s}
            height={s * 0.4}
            viewBox="0 0 100 40"
            fill="none"
            className={cn("animate-draw", className)}
            style={{ transform: `rotate(${rotationMap[direction]}deg)` }}
        >
            <path
                d="M5 20 C 20 18, 40 22, 60 20 S 75 18, 85 20"
                stroke={colorMap[color]}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="200"
                strokeDashoffset="0"
            />
            <path
                d="M75 12 L 92 20 L 75 28"
                stroke={colorMap[color]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

/* ===== COACH CIRCLE ===== */
interface CoachCircleProps {
    children?: React.ReactNode;
    className?: string;
    color?: "primary" | "secondary" | "accent";
    size?: "sm" | "md" | "lg";
}

export function CoachCircle({
    children,
    className,
    color = "primary",
    size = "md",
}: CoachCircleProps) {
    const colorMap = {
        primary: "var(--ink-primary)",
        secondary: "var(--ink-secondary)",
        accent: "var(--ink-accent)",
    };

    const sizeMap = { sm: 60, md: 100, lg: 150 };
    const s = sizeMap[size];

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg
                width={s}
                height={s}
                viewBox="0 0 100 100"
                className="absolute inset-0 animate-draw"
                fill="none"
            >
                <ellipse
                    cx="50"
                    cy="50"
                    rx="42"
                    ry="40"
                    stroke={colorMap[color]}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="300"
                    strokeDashoffset="0"
                    transform="rotate(-5 50 50)"
                />
            </svg>
            {children}
        </div>
    );
}

/* ===== TACTICAL LINE ===== */
interface TacticalLineProps {
    className?: string;
    variant?: "dashed" | "solid" | "dotted";
    color?: "primary" | "secondary" | "pencil";
    orientation?: "horizontal" | "vertical";
}

export function TacticalLine({
    className,
    variant = "dashed",
    color = "pencil",
    orientation = "horizontal",
}: TacticalLineProps) {
    const colorMap = {
        primary: "var(--ink-primary)",
        secondary: "var(--ink-secondary)",
        pencil: "var(--pencil)",
    };

    const dashMap = {
        dashed: "8 4",
        solid: "none",
        dotted: "2 4",
    };

    const isHorizontal = orientation === "horizontal";

    return (
        <svg
            width={isHorizontal ? "100%" : 4}
            height={isHorizontal ? 4 : "100%"}
            className={cn("overflow-visible", className)}
            preserveAspectRatio="none"
        >
            <line
                x1={isHorizontal ? 0 : 2}
                y1={isHorizontal ? 2 : 0}
                x2={isHorizontal ? "100%" : 2}
                y2={isHorizontal ? 2 : "100%"}
                stroke={colorMap[color]}
                strokeWidth="2"
                strokeDasharray={dashMap[variant]}
                strokeLinecap="round"
            />
        </svg>
    );
}

/* ===== TAPE ===== */
interface TapeProps {
    children?: React.ReactNode;
    className?: string;
    rotation?: number;
}

export function Tape({ children, className, rotation = -2 }: TapeProps) {
    return (
        <div
            className={cn("tape inline-block", className)}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {children}
        </div>
    );
}

/* ===== SCRIBBLE HIGHLIGHT ===== */
interface ScribbleHighlightProps {
    children: React.ReactNode;
    className?: string;
    color?: "primary" | "accent";
}

export function ScribbleHighlight({
    children,
    className,
    color = "accent",
}: ScribbleHighlightProps) {
    return (
        <span
            className={cn(
                "relative inline-block",
                color === "accent" && "coach-highlight",
                className
            )}
        >
            {children}
        </span>
    );
}

/* ===== PINNED NOTE ===== */
interface PinnedNoteProps {
    children: React.ReactNode;
    className?: string;
    tapePosition?: "top" | "corner";
}

export function PinnedNote({
    children,
    className,
    tapePosition = "top",
}: PinnedNoteProps) {
    return (
        <div className={cn("relative notebook-card p-4", className)}>
            {tapePosition === "top" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Tape rotation={-1}>
                        <span className="text-xs text-pencil-light font-hand">📌</span>
                    </Tape>
                </div>
            )}
            {tapePosition === "corner" && (
                <>
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-[rgba(255,243,176,0.85)] rotate-12 shadow-sm" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[rgba(255,243,176,0.85)] -rotate-12 shadow-sm" />
                </>
            )}
            {children}
        </div>
    );
}

/* ===== COACH UNDERLINE ===== */
interface CoachUnderlineProps {
    children: React.ReactNode;
    className?: string;
}

export function CoachUnderline({ children, className }: CoachUnderlineProps) {
    return (
        <span className={cn("coach-underline", className)}>
            {children}
        </span>
    );
}
