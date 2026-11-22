import svgPaths from "./svg-8sfn01wu75";

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] tracking-[1.3px] uppercase w-[217.73px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Monday, Oct 14 • 08:45 AM</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container2 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[76px] justify-center leading-[38px] not-italic relative shrink-0 text-[#1c1c1e] text-[32px] tracking-[-2px] uppercase w-[206.95px] whitespace-pre-wrap">
        <p className="mb-0">WORKOUT</p>
        <p>COMPLETE</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <Margin />
      <Heading />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[17.5px] relative shrink-0 w-[13.333px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 17.5">
        <g id="Container">
          <path d={svgPaths.p105e9c80} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonShareWorkout() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[48px]" data-name="Button - Share Workout">
      <Container3 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <ButtonShareWorkout />
    </div>
  );
}

function HeaderSection() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header Section">
      <div className="content-stretch flex flex-col items-start pb-[24px] pt-[32px] px-[24px] relative w-full">
        <Container />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px] whitespace-pre-wrap">Duration</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[24px] tracking-[-0.6px] w-full">
        <p className="leading-[32px] whitespace-pre-wrap">01:14:00</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[4px] items-start left-px p-[24px] right-[171.5px] top-px" data-name="Background">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#04f] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px] whitespace-pre-wrap">Volume</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[32px] leading-[0] relative shrink-0 tracking-[-0.6px] w-full" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold h-[32px] justify-center left-0 text-[#04f] text-[24px] top-[15.5px] w-[96.61px]">
        <p className="leading-[32px] whitespace-pre-wrap">{`14,200 `}</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center left-[96.61px] not-italic text-[#8e8e93] text-[12px] top-[19.5px] uppercase w-[20.55px]">
        <p className="leading-[16px] whitespace-pre-wrap">lbs</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[4px] items-start left-[171.5px] p-[24px] right-px top-px" data-name="Background">
      <Container6 />
      <Paragraph />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px] whitespace-pre-wrap">Total Sets</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[24px] tracking-[-0.6px] w-full">
        <p className="leading-[32px] whitespace-pre-wrap">24</p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[4px] items-start left-px p-[24px] right-[171.5px] top-[101px]" data-name="Background">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] tracking-[1px] uppercase w-full">
        <p className="leading-[15px] whitespace-pre-wrap">Intensity</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[24px] tracking-[-1.2px] uppercase w-full">
        <p className="leading-[32px] whitespace-pre-wrap">High</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[4px] items-start left-[171.5px] p-[24px] right-px top-[101px]" data-name="Background">
      <Container9 />
      <Container10 />
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#e5e5ea] h-[201px] relative rounded-[24px] shrink-0 w-full" data-name="Background+Border">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Background />
        <Background1 />
        <Background2 />
        <Background3 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e5e5ea] border-solid inset-0 pointer-events-none rounded-[24px]" />
    </div>
  );
}

function SectionHeroStatsGrid() {
  return (
    <div className="relative shrink-0 w-full" data-name="Section - Hero Stats Grid">
      <div className="content-stretch flex flex-col items-start pb-[32px] px-[24px] relative w-full">
        <BackgroundBorder />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[9px] relative shrink-0 w-full" data-name="Heading 3">
      <div aria-hidden="true" className="absolute border-[#1c1c1e] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[11px] tracking-[1.1px] uppercase w-[106.23px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Muscle Impact</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[12px] w-[37.14px]">
        <p className="leading-[18px] whitespace-pre-wrap">Quads</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-[27.23px]">
        <p className="leading-[18px] whitespace-pre-wrap">90%</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container15 />
      <Container16 />
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#e5e5ea] h-[4px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#04f] inset-[0_10%_0_0]" data-name="Background" />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 right-[195px] top-0" data-name="Container">
      <Container14 />
      <Background4 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[12px] w-[33.63px]">
        <p className="leading-[18px] whitespace-pre-wrap">Chest</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-[26.72px]">
        <p className="leading-[18px] whitespace-pre-wrap">65%</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end justify-between relative w-full">
          <Container19 />
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#e5e5ea] h-[4px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[rgba(0,68,255,0.4)] inset-[0_35%_0_0]" data-name="Overlay" />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[195px] right-0 top-0" data-name="Container">
      <Container18 />
      <Background5 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[12px] w-[28.34px]">
        <p className="leading-[18px] whitespace-pre-wrap">Back</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-[27.55px]">
        <p className="leading-[18px] whitespace-pre-wrap">40%</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#e5e5ea] h-[4px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[rgba(0,68,255,0.4)] inset-[0_60%_0_0]" data-name="Overlay" />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 right-[195px] top-[46px]" data-name="Container">
      <Container22 />
      <Background6 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[12px] w-[27.52px]">
        <p className="leading-[18px] whitespace-pre-wrap">Core</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-[27.19px]">
        <p className="leading-[18px] whitespace-pre-wrap">30%</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Container28 />
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#e5e5ea] h-[4px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[rgba(0,68,255,0.2)] inset-[0_70.01%_0_0]" data-name="Overlay" />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-[195px] right-0 top-[46px]" data-name="Container">
      <Container26 />
      <Background7 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[76px] relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container17 />
      <Container21 />
      <Container25 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Container12 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="relative shrink-0" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[11px] tracking-[1.1px] uppercase w-[149.39px]">
          <p className="leading-[16.5px] whitespace-pre-wrap">Volume Distribution</p>
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] tracking-[0.5px] uppercase w-[53.69px]">
          <p className="leading-[15px] whitespace-pre-wrap">Sets 1-24</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-end justify-between pb-[9px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-b border-solid inset-0 pointer-events-none" />
      <Heading2 />
      <Container30 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end justify-between px-[8px] relative size-full">
          <div className="bg-[rgba(0,68,255,0.1)] flex-[1_0_0] h-[32px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
          <div className="bg-[rgba(0,68,255,0.2)] flex-[1_0_0] h-[48px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
          <div className="bg-[rgba(0,68,255,0.4)] flex-[1_0_0] h-[68px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
          <div className="bg-[#04f] flex-[1_0_0] h-full min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Background" />
          <div className="bg-[rgba(0,68,255,0.8)] flex-[1_0_0] h-[60px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
          <div className="bg-[rgba(0,68,255,0.6)] flex-[1_0_0] h-[44px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
          <div className="bg-[rgba(0,68,255,0.3)] flex-[1_0_0] h-[36px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
          <div className="bg-[rgba(0,68,255,0.1)] flex-[1_0_0] h-[24px] min-h-px min-w-px rounded-tl-[8px] rounded-tr-[8px]" data-name="Overlay" />
        </div>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <HorizontalBorder />
      <Container31 />
    </div>
  );
}

function SectionExerciseSummaryList() {
  return (
    <div className="relative shrink-0 w-full" data-name="Section - Exercise Summary List">
      <div className="content-stretch flex flex-col gap-[32px] items-start pb-[40px] px-[24px] relative w-full">
        <Container11 />
        <Container29 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="relative shrink-0" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] tracking-[1.3px] uppercase w-[174.47px]">
          <p className="leading-[19.5px] whitespace-pre-wrap">Exercise Breakdown</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="content-stretch flex h-[28.5px] items-center pb-[10px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-b border-solid inset-0 pointer-events-none" />
      <Heading3 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[108.42px]">
        <p className="leading-[23.38px] whitespace-pre-wrap">Barbell Squat</p>
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(0,68,255,0.1)] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#04f] text-[10px] text-center tracking-[0.25px] uppercase w-[24.61px]">
        <p className="leading-[15px] whitespace-pre-wrap">Gym</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-[38.28px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">5 Sets</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Overlay />
      <Container36 />
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3px] items-start relative">
        <Container34 />
        <Container35 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex items-start justify-end left-[29.02px] top-[3px]" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] relative shrink-0 text-[#8e8e93] text-[12px] text-right w-[14.41px]">
        <p className="leading-[18px] whitespace-pre-wrap">lb</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[79.44px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-[52.42px] text-[#1c1c1e] text-[15px] text-right top-[11px] w-[27.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">315</p>
      </div>
      <Container39 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-0 text-[#1c1c1e] text-[15px] text-right top-[11px] w-[36.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">{` × 8`}</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container38 />
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[17px] pt-[15px] relative shrink-0 w-full" data-name="Item 1">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-b border-solid inset-0 pointer-events-none" />
      <Container33 />
      <Container37 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[101.41px]">
        <p className="leading-[23.38px] whitespace-pre-wrap">Bench Press</p>
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(0,68,255,0.1)] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#04f] text-[10px] text-center tracking-[0.25px] uppercase w-[24.61px]">
        <p className="leading-[15px] whitespace-pre-wrap">Gym</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-[38.97px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">4 Sets</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Overlay1 />
      <Container43 />
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2.99px] items-start relative">
        <Container41 />
        <Container42 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute content-stretch flex items-start justify-end left-[29.02px] top-[3px]" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] relative shrink-0 text-[#8e8e93] text-[12px] text-right w-[14.41px]">
        <p className="leading-[18px] whitespace-pre-wrap">lb</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[79.44px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-[52.42px] text-[#1c1c1e] text-[15px] text-right top-[11px] w-[27.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">225</p>
      </div>
      <Container46 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-0 text-[#1c1c1e] text-[15px] text-right top-[11px] w-[36.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">{` × 5`}</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container45 />
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[17px] pt-[15px] relative shrink-0 w-full" data-name="Item 2">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-b border-solid inset-0 pointer-events-none" />
      <Container40 />
      <Container44 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[62.78px]">
        <p className="leading-[23.38px] whitespace-pre-wrap">Deadlift</p>
      </div>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(0,68,255,0.1)] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#04f] text-[10px] text-center tracking-[0.25px] uppercase w-[24.61px]">
        <p className="leading-[15px] whitespace-pre-wrap">Gym</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-[38.59px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">3 Sets</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Overlay2 />
      <Container50 />
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3px] items-start relative">
        <Container48 />
        <Container49 />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="absolute content-stretch flex items-start justify-end left-[29.02px] top-[3px]" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] relative shrink-0 text-[#8e8e93] text-[12px] text-right w-[14.41px]">
        <p className="leading-[18px] whitespace-pre-wrap">lb</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[79.44px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-[52.42px] text-[#1c1c1e] text-[15px] text-right top-[11px] w-[27.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">405</p>
      </div>
      <Container53 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-0 text-[#1c1c1e] text-[15px] text-right top-[11px] w-[36.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">{` × 3`}</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container52 />
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[17px] pt-[15px] relative shrink-0 w-full" data-name="Item 3">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-b border-solid inset-0 pointer-events-none" />
      <Container47 />
      <Container51 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] w-[58.3px]">
        <p className="leading-[23.38px] whitespace-pre-wrap">Pull-up</p>
      </div>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(255,107,0,0.1)] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#ff6b00] text-[10px] text-center tracking-[0.25px] uppercase w-[24.06px]">
        <p className="leading-[15px] whitespace-pre-wrap">Cali</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] w-[38.59px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">3 Sets</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Overlay3 />
      <Container57 />
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col gap-[2.99px] items-start relative shrink-0" data-name="Container">
      <Container55 />
      <Container56 />
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute content-stretch flex items-start justify-end left-[29.02px] top-[3px]" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[18px] justify-center leading-[0] relative shrink-0 text-[#8e8e93] text-[12px] text-right w-[14.41px]">
        <p className="leading-[18px] whitespace-pre-wrap">lb</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[88.44px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-[61.42px] text-[#1c1c1e] text-[15px] text-right top-[11px] w-[27.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">+45</p>
      </div>
      <Container60 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] right-0 text-[#1c1c1e] text-[15px] text-right top-[11px] w-[45.02px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">{` × 10`}</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container59 />
    </div>
  );
}

function Item3() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[16px] pt-[15px] relative shrink-0 w-full" data-name="Item 4">
      <Container54 />
      <Container58 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Section() {
  return (
    <div className="relative shrink-0 w-full" data-name="Section">
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[96px] px-[24px] relative w-full">
        <HorizontalBorder1 />
        <Container32 />
      </div>
    </div>
  );
}

function MainContainerFlexColFullHeight() {
  return (
    <div className="bg-gradient-to-b content-stretch flex flex-col from-[rgba(0,68,255,0.05)] items-start min-h-[1161px] overflow-clip relative shrink-0 to-[#f5f5f7] to-[30%] w-full" data-name="Main Container: Flex col, full height">
      <HeaderSection />
      <SectionHeroStatsGrid />
      <SectionExerciseSummaryList />
      <Section />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#1c1c1e] content-stretch flex h-[64px] items-center justify-center relative shrink-0 w-full" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 right-0 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-0" data-name="Button:shadow" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[2.8px] uppercase w-[51.28px]">
        <p className="leading-[21px] whitespace-pre-wrap">DONE</p>
      </div>
    </div>
  );
}

function FixedFooterAction() {
  return (
    <div className="absolute bg-gradient-to-t bottom-0 content-stretch flex flex-col from-[#f5f5f7] items-start left-0 p-[24px] right-0 to-[rgba(245,245,247,0)] via-1/2 via-[rgba(245,245,247,0.95)]" data-name="Fixed Footer Action">
      <Button />
    </div>
  );
}

export default function Body() {
  return (
    <div className="bg-[#f5f5f7] content-stretch flex flex-col items-start relative size-full" data-name="Body">
      <MainContainerFlexColFullHeight />
      <FixedFooterAction />
    </div>
  );
}