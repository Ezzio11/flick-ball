import Image from 'next/image';
import honours from '@/lib/honours.json';
import { flickTrophies, type Honours } from '@/lib/achievements';

// Centres of the three blank badges in trophy-room.webp, as % of the image (measured from the art).
const BADGES = [
    { competition: 'LaLiga', left: 32.18, top: 68.25 },
    { competition: 'Copa del Rey', left: 57.08, top: 70.57 },
    { competition: 'Supercopa de España', left: 83.94, top: 67.0 },
];

const won = flickTrophies(honours as Honours);
const count = (competition: string) => won.filter(t => t.competition === competition).length;

/** The "Trophy Room" sticker, with live trophy counts under Flick (updated by the daily data run). */
export default function TrophyStamp({ width, priority }: { width: number; priority?: boolean }) {
    const label = BADGES.map(b => `${count(b.competition)} ${b.competition}`).join(', ');
    return (
        <div className="relative" style={{ width, containerType: 'inline-size' }}>
            <Image src="/images/trophy-room.webp" alt={`Trophy Room: ${label}`} width={1024} height={644}
                style={{ width: '100%', height: 'auto' }} priority={priority} />
            {BADGES.map(b => (
                <span key={b.competition} aria-hidden
                    className="absolute -translate-x-1/2 -translate-y-1/2 leading-none text-black"
                    style={{ left: `${b.left}%`, top: `${b.top}%`, fontSize: '7cqw', fontFamily: 'var(--font-bangers)' }}>
                    {count(b.competition)}x
                </span>
            ))}
        </div>
    );
}
