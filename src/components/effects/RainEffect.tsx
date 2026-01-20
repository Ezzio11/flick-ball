"use client";

import { useEffect, useRef } from 'react';

class Drop {
    static color = '#76a5d2';
    static minSize = 15;
    static maxSize = 170;
    static minAngle = 44.95;
    static maxAngle = 45.05;
    static speed = 1.0;
    static totalCount = 512;

    pos: [number, number];
    size: number;
    angle: number;
    color: string;

    constructor(xpos = 0, ypos = 0, color = Drop.color) {
        // set drop position
        this.pos = [xpos, ypos];

        // set drop size based on weighted distribution
        let sizeRange = Drop.maxSize - Drop.minSize;
        let sizeRandMin = Drop.minSize;
        let sizeRandMax = Drop.maxSize;

        let rand = Math.random();
        if (rand < 0.7) { // small 70%
            sizeRandMin = Drop.minSize;
            sizeRandMax = Drop.minSize + sizeRange / 3;
        } else if (rand < 0.90) { // medium 20%
            sizeRandMin = Drop.minSize + sizeRange / 3;
            sizeRandMax = Drop.maxSize - sizeRange / 3;
        } else { // large 10%
            sizeRandMin = Drop.maxSize - sizeRange / 3;
            sizeRandMax = Drop.maxSize;
        }

        this.size = Math.random() * (sizeRandMax - sizeRandMin) + sizeRandMin;

        // set variation in drop angle
        this.angle = Math.random() * (Drop.maxAngle - Drop.minAngle) + Drop.minAngle;

        // set drop color
        this.color = color;
    }

    // Update this drop
    update() {
        this.pos[0] += 5 * this.size / 75 * Drop.speed;
        this.pos[1] += 20 * this.size / 75 * Drop.speed;
        this.size -= 0.01;
    }

    // Draw this drop on the given context
    draw(ctx: CanvasRenderingContext2D) {
        let startPos = this.pos;
        let endPos = [
            this.pos[0] + this.size / 2 * Math.cos(this.angle),
            this.pos[1] + this.size
        ];

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 77;
        ctx.beginPath();
        ctx.moveTo(startPos[0], startPos[1]);
        ctx.lineTo(endPos[0], endPos[1]);
        ctx.stroke();
    }
}

function newDrop(winWidth: number, winHeight: number, x?: number, y?: number) {
    let minX = -winWidth;
    let maxX = winWidth;
    let minY = -winHeight;
    let maxY = 0;

    let randX = Math.random() * (maxX - minX) + minX;
    let randY = Math.random() * (maxY - minY) + minY;

    let xPos = x === undefined ? randX - Drop.maxSize : x;
    let yPos = y === undefined ? randY - Drop.maxSize : y;

    return new Drop(xPos, yPos);
}

export default function RainEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log("Canvas not supported.");
            return;
        }

        // Set drop color for rainy night theme
        Drop.color = '#76a5d2';
        Drop.totalCount = 512;
        Drop.speed = 1.0;

        let drops: Drop[] = [];
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;

        // Set canvas size
        canvas.width = winWidth;
        canvas.height = winHeight;

        // Handle window resize
        const handleResize = () => {
            winWidth = window.innerWidth;
            winHeight = window.innerHeight;
            canvas.width = winWidth;
            canvas.height = winHeight;
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const interval = setInterval(() => {
            // Clear canvas
            ctx.clearRect(0, 0, winWidth, winHeight);

            // Populate new drops if drops array is smaller than the drops total count
            for (let i = 0; i < Drop.totalCount - drops.length; i++) {
                drops.push(newDrop(winWidth, winHeight));
            }

            // Draw and update each drop
            for (let i = 0; i < drops.length; i++) {
                const drop = drops[i];
                drop.draw(ctx);
                drop.update();
            }

            // Remove all off-screen drops
            for (let i = drops.length - 1; i > 0; i--) {
                if (drops[i].pos[0] > winWidth || drops[i].pos[1] > winHeight) {
                    drops.splice(i, 1);
                }
            }
        }, 20);

        // Cleanup
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
