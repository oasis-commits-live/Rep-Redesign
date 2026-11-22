import svgPaths from "./svg-hs4wciim4c";

function Container() {
  return (
    <div className="relative shrink-0 size-[16.333px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3333 16.3333">
        <g id="Container">
          <path d={svgPaths.pfd3f880} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] tracking-[1.2px] uppercase w-[125.28px]">
        <p className="leading-[16px] whitespace-pre-wrap">Routine Builder</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <Container2 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[40px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-center justify-center px-[16px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0647f9] text-[16px] text-center w-[37.89px]">
          <p className="leading-[24px] whitespace-pre-wrap">Save</p>
        </div>
      </div>
    </div>
  );
}

function HeaderNav() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.85)] relative shrink-0 w-[388px] z-[3]" data-name="Header / Nav">
      <div aria-hidden="true" className="absolute border-[rgba(229,229,234,0.5)] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[17px] pl-[24px] pr-[24.02px] pt-[16px] relative w-full">
        <Button />
        <Container1 />
        <Button1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[26px] justify-center leading-[0] not-italic relative shrink-0 text-[17px] text-center text-white w-[107.08px]">
        <p className="leading-[25.5px] whitespace-pre-wrap">Save Routine</p>
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] content-stretch flex flex-col items-center px-[6px] py-[2px] relative rounded-[2px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['JetBrains_Mono:Regular',sans-serif] font-normal h-[17px] justify-center leading-[0] relative shrink-0 text-[11px] text-center text-white w-[33px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">CMD+S</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#1c1c1e] relative rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center pb-[16px] pt-[15px] relative w-full">
        <Container3 />
        <Overlay />
      </div>
    </div>
  );
}

function StickyFooterAction() {
  return (
    <div className="absolute backdrop-blur-[10px] bg-[rgba(255,255,255,0.85)] bottom-px left-px right-px z-[2]" data-name="Sticky Footer Action">
      <div aria-hidden="true" className="absolute border-[rgba(229,229,234,0.5)] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[24px] pt-[25px] px-[24px] relative w-full">
        <Button2 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[32px] tracking-[-0.8px] w-full">
          <p className="leading-[normal] whitespace-pre-wrap">Monday Power</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="relative shrink-0 w-full" data-name="Input">
      <div className="content-stretch flex items-start justify-center overflow-clip pb-px relative rounded-[inherit] w-full">
        <Container5 />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0)] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bottom-[20%] content-stretch flex flex-col items-start opacity-0 right-0 top-[20%]" data-name="Container">
      <div className="relative shrink-0 size-[18px]" data-name="Icon">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <path d={svgPaths.pad10a80} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Input />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Container">
          <path d={svgPaths.p15221b80} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[14px] w-[50.41px]">
          <p className="leading-[20px] whitespace-pre-wrap">45 min</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[13px] py-[7px] relative rounded-[9999px] shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e5e5ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 size-[14.85px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.85 14.85">
        <g id="Container">
          <path d={svgPaths.p2cc3e380} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[14px] w-[92.41px]">
          <p className="leading-[20px] whitespace-pre-wrap">5 Movements</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[13px] py-[7px] relative rounded-[9999px] shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e5e5ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <BackgroundBorderShadow />
      <BackgroundBorderShadow1 />
    </div>
  );
}

function SectionRoutineMetadata() {
  return (
    <div className="relative shrink-0 w-full" data-name="Section - Routine Metadata">
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-[32px] px-[24px] relative w-full">
        <Container4 />
        <Container7 />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e5e5ea] content-stretch flex h-[6px] items-start overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="bg-[#0647f9] h-full shrink-0 w-[204px]" data-name="Background" />
      <div className="bg-[#ff6b00] h-full shrink-0 w-[136px]" data-name="Background" />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#0647f9] text-[10px] tracking-[0.5px] uppercase w-[53.11px]">
        <p className="leading-[15px] whitespace-pre-wrap">Gym 60%</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#ff6b00] text-[10px] tracking-[0.5px] uppercase w-[53.09px]">
        <p className="leading-[15px] whitespace-pre-wrap">Cali 40%</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function ModalitySplitVisualizer() {
  return (
    <div className="relative shrink-0 w-full" data-name="Modality Split Visualizer">
      <div className="content-stretch flex flex-col gap-[8px] items-start pb-[24px] px-[24px] relative w-full">
        <Background />
        <Container12 />
      </div>
    </div>
  );
}

function DragHandle() {
  return (
    <div className="h-[16px] relative shrink-0 w-[10px]" data-name="Drag Handle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 16">
        <g id="Drag Handle">
          <path d={svgPaths.p3db92600} fill="var(--fill-0, #E5E5EA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[26px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[62.78px]">
        <p className="leading-[25.5px] whitespace-pre-wrap">Deadlift</p>
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(6,71,249,0.1)] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[6px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#0647f9] text-[10px] tracking-[0.5px] uppercase w-[25.36px]">
        <p className="leading-[15px] whitespace-pre-wrap">Gym</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex items-center justify-between mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Overlay1 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-full">
        <p className="leading-[19.5px] whitespace-pre-wrap">Posterior Chain</p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Content">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px relative w-full">
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
        <g id="Container">
          <path d={svgPaths.p303d500} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonAction() {
  return (
    <div className="relative shrink-0" data-name="Button - Action">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container17 />
      </div>
    </div>
  );
}

function Item1Gym() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[16px] items-center left-[16px] pb-[17px] pt-[16px] px-[17px] right-[16px] rounded-[24px] top-0" data-name="Item 1: Gym">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <DragHandle />
      <Content />
      <ButtonAction />
    </div>
  );
}

function DragHandle1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[10px]" data-name="Drag Handle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 16">
        <g id="Drag Handle">
          <path d={svgPaths.p3db92600} fill="var(--fill-0, #0647F9)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[26px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[155.167px]">
        <p className="leading-[25.5px] whitespace-pre-wrap">Pull-Up (Weighted)</p>
      </div>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(255,107,0,0.1)] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[6px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#ff6b00] text-[10px] tracking-[0.5px] uppercase w-[25.059px]">
        <p className="leading-[15px] whitespace-pre-wrap">Cali</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex items-center justify-between mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Overlay2 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-full">
        <p className="leading-[19.5px] whitespace-pre-wrap">Lats / Biceps</p>
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px pb-px relative" data-name="Content">
      <Container18 />
      <Container19 />
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
        <g id="Container">
          <path d={svgPaths.p303d500} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonAction1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button - Action">
      <Container20 />
    </div>
  );
}

function Item2CalisthenicsActiveDragStateSimulation() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] items-center pb-[16px] pt-[15px] px-[16px] relative rounded-[24px] w-full" data-name="Item 2: Calisthenics (Active Drag State Simulation)">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_-7.12px_-1.54px_0] rounded-[24px] shadow-[0px_0px_0px_1px_rgba(6,71,249,0.2),0px_20px_40px_-10px_rgba(0,0,0,0.15)]" data-name="Item 2: Calisthenics (Active Drag State Simulation):shadow" />
      <DragHandle1 />
      <Content1 />
      <ButtonAction1 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[16px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 16">
        <g id="Drag Handle">
          <path d={svgPaths.p3db92600} fill="var(--fill-0, #E5E5EA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[26px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[162.66px]">
        <p className="leading-[25.5px] whitespace-pre-wrap">Barbell Bench Press</p>
      </div>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(6,71,249,0.1)] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[6px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#0647f9] text-[10px] tracking-[0.5px] uppercase w-[25.36px]">
        <p className="leading-[15px] whitespace-pre-wrap">Gym</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex items-center justify-between mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Overlay3 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-full">
        <p className="leading-[19.5px] whitespace-pre-wrap">Chest / Triceps</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px relative w-full">
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
        <g id="Container">
          <path d={svgPaths.p303d500} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container25 />
      </div>
    </div>
  );
}

function Item3Gym() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[16px] items-center left-[16px] pb-[17px] pt-[16px] px-[17px] right-[16px] rounded-[24px] top-[180px]" data-name="Item 3: Gym">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container21 />
      <Container22 />
      <Button3 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[16px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 16">
        <g id="Drag Handle">
          <path d={svgPaths.p3db92600} fill="var(--fill-0, #E5E5EA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[26px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[166.69px]">
        <p className="leading-[25.5px] whitespace-pre-wrap">Hip 90/90 Transition</p>
      </div>
    </div>
  );
}

function Overlay4() {
  return (
    <div className="bg-[rgba(45,106,79,0.1)] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[6px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d6a4f] text-[10px] tracking-[0.5px] uppercase w-[31.08px]">
        <p className="leading-[15px] whitespace-pre-wrap">Flow</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex items-center justify-between mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Overlay4 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-full">
        <p className="leading-[19.5px] whitespace-pre-wrap">Hip Mobility</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px relative w-full">
        <Container28 />
        <Container29 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
        <g id="Container">
          <path d={svgPaths.p303d500} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container30 />
      </div>
    </div>
  );
}

function Item4Flow() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[16px] items-center left-[16px] pb-[17px] pt-[16px] px-[17px] right-[16px] rounded-[24px] top-[271px]" data-name="Item 4: Flow">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container26 />
      <Container27 />
      <Button4 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[16px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 16">
        <g id="Drag Handle">
          <path d={svgPaths.p3db92600} fill="var(--fill-0, #E5E5EA)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[26px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[151.33px]">
        <p className="leading-[25.5px] whitespace-pre-wrap">Hanging Leg Raise</p>
      </div>
    </div>
  );
}

function Overlay5() {
  return (
    <div className="bg-[rgba(255,107,0,0.1)] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[6px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#ff6b00] text-[10px] tracking-[0.5px] uppercase w-[25.06px]">
        <p className="leading-[15px] whitespace-pre-wrap">Cali</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex items-center justify-between mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <Heading4 />
      <Overlay5 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-full">
        <p className="leading-[19.5px] whitespace-pre-wrap">Core</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px relative w-full">
        <Container33 />
        <Container34 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
        <g id="Container">
          <path d={svgPaths.p303d500} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative">
        <Container35 />
      </div>
    </div>
  );
}

function Item5Calisthenics() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[16px] items-center left-[16px] pb-[17px] pt-[16px] px-[17px] right-[16px] rounded-[24px] top-[362px]" data-name="Item 5: Calisthenics">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container31 />
      <Container32 />
      <Button5 />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p2d8e4cc0} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[15px] text-center w-[108.94px]">
          <p className="leading-[22.5px] whitespace-pre-wrap">Add Movement</p>
        </div>
      </div>
    </div>
  );
}

function AddButton() {
  return (
    <div className="content-stretch flex gap-[7.99px] items-center justify-center px-px py-[17px] relative rounded-[24px] shrink-0 w-full" data-name="Add Button">
      <div aria-hidden="true" className="absolute border border-[rgba(142,142,147,0.3)] border-dashed inset-0 pointer-events-none rounded-[24px]" />
      <Container36 />
      <Container37 />
    </div>
  );
}

function AddButtonMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[16px] pt-[8px] right-[16px] top-[453px]" data-name="Add Button:margin">
      <AddButton />
    </div>
  );
}

function SectionExercisesListDraggableSortable() {
  return (
    <div className="h-[519px] relative shrink-0 w-full" data-name="Section - Exercises List (Draggable Sortable)">
      <Item1Gym />
      <div className="absolute flex items-center justify-center left-[12.44px] right-[12.44px] top-[90.23px]">
        <div className="flex-none h-[77.52px] w-[363.12px]">
          <Item2CalisthenicsActiveDragStateSimulation />
        </div>
      </div>
      <Item3Gym />
      <Item4Flow />
      <Item5Calisthenics />
      <AddButtonMargin />
    </div>
  );
}

function MainContentScrollable() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[388px] z-[1]" data-name="Main Content (Scrollable)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[128px] relative size-full">
        <SectionRoutineMetadata />
        <ModalitySplitVisualizer />
        <SectionExercisesListDraggableSortable />
      </div>
    </div>
  );
}

export default function Builder() {
  return (
    <div className="bg-[#f5f5f7] relative size-full" data-name="Builder">
      <div className="content-stretch flex flex-col isolate items-start max-w-[inherit] p-px relative size-full">
        <HeaderNav />
        <StickyFooterAction />
        <MainContentScrollable />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e5e5ea] border-solid inset-0 pointer-events-none shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}