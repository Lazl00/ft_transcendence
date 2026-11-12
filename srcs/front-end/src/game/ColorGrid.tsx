import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import './ColorGrid.css';

function randomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;
}

function ColorGrid() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const scrollDirectionRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);
    const previousFrameTimeRef = useRef<number | null>(null);
    const [colors] = useState(() =>
        Array.from({ length: 800 }, randomColor)
    );

    useEffect(() => {
        viewportRef.current?.focus();
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const animateScroll = (timestamp: number) => {
        const viewport = viewportRef.current;
        if (!viewport || scrollDirectionRef.current === 0) {
            animationFrameRef.current = null;
            return;
        }

        const previousFrameTime = previousFrameTimeRef.current ?? timestamp;
        const elapsed = Math.min(timestamp - previousFrameTime, 32);
        previousFrameTimeRef.current = timestamp;

        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        viewport.scrollLeft = Math.max(
            0,
            Math.min(maxScroll, viewport.scrollLeft + scrollDirectionRef.current * 500 * elapsed / 1000)
        );

        if ((viewport.scrollLeft === 0 && scrollDirectionRef.current < 0) ||
            (viewport.scrollLeft === maxScroll && scrollDirectionRef.current > 0)) {
            animationFrameRef.current = null;
            previousFrameTimeRef.current = null;
            return;
        }

        animationFrameRef.current = requestAnimationFrame(animateScroll);
    };

    const stopScrolling = () => {
        scrollDirectionRef.current = 0;
        previousFrameTimeRef.current = null;
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    useEffect(() => {
        const handleWindowKeyUp = (event: globalThis.KeyboardEvent) => {
            if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && scrollDirectionRef.current !== 0) {
                stopScrolling();
            }
        };

        window.addEventListener('keyup', handleWindowKeyUp);
        return () => window.removeEventListener('keyup', handleWindowKeyUp);
    }, [stopScrolling]);

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }

        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        if (scrollDirectionRef.current === direction) {
            return;
        }

        scrollDirectionRef.current = direction;
        previousFrameTimeRef.current = null;
        if (animationFrameRef.current === null) {
            animationFrameRef.current = requestAnimationFrame(animateScroll);
        }
    };

    return (
        <div
            ref={viewportRef}
            className="color-grid-viewport"
            tabIndex={0}
            aria-label="Color grid. Use the left and right arrow keys to scroll."
            onKeyDown={handleKeyDown}
            onBlur={stopScrolling}
        >
            <div className="color-grid">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className="color-cell"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        </div>
    );
}

export default ColorGrid;