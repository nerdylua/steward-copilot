import { OpenMetadataIcon } from '@/components/openmetadata-icon';
const NodeSvg = () => (<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="8" height="8" rx="2" fill="#F04D26"/>
    </svg>);
const LogoSvg = () => (
    <OpenMetadataIcon
        size={31}
        className="drop-shadow-[0_0_12px_rgba(141,106,240,0.35)]"
    />
);
export function SectionSeparators() {
    return (<>
            
            <div className="lg:hidden w-full mx-auto flex justify-center items-center pointer-events-none z-20 mt-0 py-1">
                
                <div className="flex-shrink-0">
                    <NodeSvg />
                </div>
                
                <div className="relative w-16 h-px bg-white/30"/>
                
                <div className="flex-shrink-0">
                    <NodeSvg />
                </div>
                
                <div className="flex-shrink-0 mx-3">
                    <LogoSvg />
                </div>
                
                <div className="flex-shrink-0">
                    <NodeSvg />
                </div>
                
                <div className="relative w-16 h-px bg-white/30"/>
                
                <div className="flex-shrink-0">
                    <NodeSvg />
                </div>
            </div>

            
            <div className="hidden lg:flex items-center w-full mx-auto pointer-events-none z-20 mt-0 py-2 justify-center">
                
                <div className="flex-shrink-0">
                    <NodeSvg />
                </div>
                
                <div className="relative w-56 h-px bg-white/30"/>
                
                <div className="flex-shrink-0 mr-2">
                    <NodeSvg />
                </div>
                
                <div className="flex-shrink-0 mx-4">
                    <LogoSvg />
                </div>
                
                <div className="flex-shrink-0 ml-2">
                    <NodeSvg />
                </div>
                
                <div className="relative w-56 h-px bg-white/30"/>
                
                <div className="flex-shrink-0">
                    <NodeSvg />
                </div>
            </div>
        </>);
}
