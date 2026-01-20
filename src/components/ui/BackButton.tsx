import Link from 'next/link';

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
    variant?: 'white' | 'yellow' | 'dark';
}

export default function BackButton({
    href = "/",
    label = "Back Home",
    className = "",
    variant = 'white'
}: BackButtonProps) {
    const baseStyles = "inline-block comic-button px-6 py-2 text-xl font-bold uppercase transform -skew-x-10 shadow-[6px_6px_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 active:bg-black active:text-white transition-all border-3 border-black no-underline hover:text-inherit";

    const variants = {
        white: "bg-white text-black",
        yellow: "bg-[#EDBB00] text-black",
        dark: "bg-[#1a1f2e] text-white"
    };

    return (
        <Link
            href={href}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            ← {label}
        </Link>
    );
}
