import { AggregatedStats } from '@/lib/playerHelpers';
import { cn } from '@/lib/utils';

interface DetailedStatsProps {
    stats: AggregatedStats;
    position?: string;
}

export default function DetailedStats({ stats, position }: DetailedStatsProps) {
    const isGoalkeeper = position === 'Goalkeeper' || position === 'GK';

    return (
        <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0_#000]">
            {/* Header */}
            <div className="bg-black text-white p-3 flex justify-between items-center mb-1">
                <span className=" text-2xl uppercase tracking-widest text-yellow-400" style={{ fontFamily: "var(--font-bangers)" }}>Full Season Breakdown</span>
            </div>

            <div className="p-6 bg-[#fffdf5] border-2 border-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                {isGoalkeeper ? (
                    <>
                        {/* GOALKEEPING */}
                        <StatCategory title="Goalkeeping" color="bg-green-600">
                            <StatRow label="Clean Sheets" value={stats.totalCleanSheets} />
                            <StatRow label="Saves" value={stats.totalSaves} />
                            <StatRow label="Goals Conceded" value={stats.totalGoalsConceded} />
                            <StatRow label="Goals Prevented (avg)" value={stats.avgGoalsPrevented?.toFixed(2)} />
                            <StatRow label="Clearances" value={stats.totalClearances} />
                            <StatRow label="Recoveries" value={stats.totalRecoveries} />
                        </StatCategory>

                        {/* DISTRIBUTION */}
                        <StatCategory title="Distribution" color="bg-yellow-500">
                            <StatRow label="Passes Completed" value={stats.totalPasses} />
                            <StatRow label="Pass Accuracy %" value={stats.avgPassAccuracy?.toFixed(1)} />
                            <StatRow label="Long Balls" value={stats.totalLongBalls} />
                            <StatRow label="Touches" value={stats.totalTouches} />
                            <StatRow label="Total Assists" value={stats.totalAssists} />
                            <StatRow label="xA" value={stats.totalxA?.toFixed(2)} />
                        </StatCategory>

                        {/* SWEEPING */}
                        <StatCategory title="Sweeping" color="bg-blue-600">
                            <StatRow label="Interceptions" value={stats.totalInterceptions} />
                            <StatRow label="Duels Won" value={stats.totalDuelsWon} />
                            <StatRow label="Aerial Duels Won" value={stats.totalAerialsWon} />
                            <StatRow label="Blocks" value={stats.totalBlocks} />
                            <StatRow label="Tackles Won" value={stats.totalTackles} />
                            <StatRow label="Dribbled Past" value={stats.totalDribbledPast} />
                        </StatCategory>

                        {/* GENERAL */}
                        <StatCategory title="General" color="bg-gray-800">
                            <StatRow label="Appearances" value={stats.appearances} />
                            <StatRow label="Minutes Played" value={stats.totalMinutes} />
                            <StatRow label="Avg FBI Rating" value={stats.avgRating?.toFixed(2)} />
                            <StatRow label="POTM Awards" value={stats.totalPOTM} />
                            <StatRow label="Yellow Cards" value={stats.totalYellowCards} />
                            <StatRow label="Red Cards" value={stats.totalRedCards} />
                        </StatCategory>
                    </>
                ) : (
                    <>
                        {/* ATTACKING */}
                        <StatCategory title="Attacking" color="bg-red-600">
                            <StatRow label="Goals" value={stats.totalGoals} />
                            <StatRow label="Assists" value={stats.totalAssists} />
                            <StatRow label="xG (Expected Goals)" value={stats.totalxG?.toFixed(2)} />
                            <StatRow label="xA (Expected Assists)" value={stats.totalxA?.toFixed(2)} />
                            <StatRow label="Total Shots" value={stats.totalShots} />
                            <StatRow label="Big Chances Missed" value={stats.totalBigChances} />
                            <StatRow label="Successful Dribbles" value={stats.totalDribbles} />
                        </StatCategory>

                        {/* PASSING */}
                        <StatCategory title="Passing" color="bg-yellow-500">
                            <StatRow label="Passes Completed" value={stats.totalPasses} />
                            <StatRow label="Key Passes" value={stats.totalKeyPasses} />
                            <StatRow label="Chances Created" value={stats.totalChancesCreated} />
                            <StatRow label="Passes into Final Third" value={stats.totalPassesFinalThird} />
                            <StatRow label="Accurate Long Balls" value={stats.totalLongBalls} />
                            <StatRow label="Accurate Crosses" value={stats.totalCrosses} />
                            <StatRow label="Touches" value={stats.totalTouches} />
                        </StatCategory>

                        {/* DEFENDING */}
                        <StatCategory title="Defending" color="bg-blue-600">
                            <StatRow label="Tackles Won" value={stats.totalTackles} />
                            <StatRow label="Interceptions" value={stats.totalInterceptions} />
                            <StatRow label="Ball Recoveries" value={stats.totalRecoveries} />
                            <StatRow label="Duels Won" value={stats.totalDuelsWon} />
                            <StatRow label="Aerial Duels Won" value={stats.totalAerialsWon} />
                            <StatRow label="Blocks" value={stats.totalBlocks} />
                            <StatRow label="Clearances" value={stats.totalClearances} />
                        </StatCategory>

                        {/* GENERAL */}
                        <StatCategory title="General" color="bg-gray-800">
                            <StatRow label="Appearances" value={stats.appearances} />
                            <StatRow label="Minutes Played" value={stats.totalMinutes} />
                            <StatRow label="Distance Covered (km)" value={stats.totalDistance?.toFixed(1)} />
                            <StatRow label="Top Speed (km/h)" value={stats.avgTopSpeed?.toFixed(1)} />
                            <StatRow label="Fouls Committed" value={stats.totalFouls} />
                            <StatRow label="Yellow Cards" value={stats.totalYellowCards} />
                            <StatRow label="Red Cards" value={stats.totalRedCards} />
                        </StatCategory>
                    </>
                )}

            </div>

            {/* Footer Note */}
            <div className="bg-gray-100 border-t-2 border-black p-2 text-center">
                <p className="font-mono text-[10px] uppercase text-gray-500 tracking-widest">
                    * Stats provided by FotMob. All competitions, Hansi Flick era.
                </p>
            </div>
        </div>
    );
}

function StatCategory({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full">
            <div className={cn("px-3 py-1 border-2 border-black border-b-0 text-white font-header-main text-xl uppercase tracking-wide inline-block w-fit shadow-[4px_4px_0_rgba(0,0,0,0.2)]", color)}>
                {title}
            </div>
            <div className="border-2 border-black p-4 flex-grow bg-white relative">
                <dl className="space-y-2">
                    {children}
                </dl>
                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-black pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string | number | undefined }) {
    return (
        <div className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-1">
            <dt className="font-mono text-xs font-bold text-gray-500 uppercase">{label}</dt>
            <dd className=" text-lg text-black leading-none" style={{ fontFamily: "var(--font-bangers)" }}>{value !== undefined ? value : '-'}</dd>
        </div>
    );
}
