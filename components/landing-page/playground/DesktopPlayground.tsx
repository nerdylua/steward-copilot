'use client';
import dynamic from 'next/dynamic';
import { SectionSeparators } from '../hero/SectionSeparators';

const PlaygroundSection = dynamic(
    () => import('./PlaygroundSection').then(m => ({ default: m.PlaygroundSection })),
    { ssr: false }
);

export function DesktopPlayground() {
    return (
        <>
            <SectionSeparators />
            <PlaygroundSection />
        </>
    );
}
