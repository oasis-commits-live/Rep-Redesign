import svgPaths from "./svg-x9sdvt7vyu";

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[162.36px] pb-[8px] top-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] tracking-[1.3px] uppercase w-[65.27px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Resting</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-15.59px)] size-[10.5px] top-1/2" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p38ac19c0} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e5e5ea] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container1 />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] left-[calc(50%+11px)] not-italic text-[#1c1c1e] text-[15px] text-center top-[calc(50%-0.75px)] w-[27.17px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">30s</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[9px] left-[calc(50%+37.31px)] top-1/2 w-[9.75px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.75 9">
        <g id="Container">
          <path d={svgPaths.p15074000} fill="var(--fill-0, #0647F9)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(6,71,249,0.1)] flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[8px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(6,71,249,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[23px] justify-center leading-[0] left-[calc(50%-13.01px)] not-italic text-[#0647f9] text-[15px] text-center top-[calc(50%-0.75px)] w-[66.64px]">
        <p className="leading-[22.5px] whitespace-pre-wrap">Skip Rest</p>
      </div>
      <Container2 />
    </div>
  );
}

function TimerControls() {
  return (
    <div className="absolute content-stretch flex gap-[16px] items-center justify-center left-[35px] max-w-[320px] right-[35px] top-[131.5px]" data-name="Timer Controls">
      <Button />
      <Button1 />
    </div>
  );
}

function TimerDisplay() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[79px] top-[27.5px]" data-name="Timer Display">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[80px] justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[52px] text-center tracking-[-1.6px] w-[232px]">
        <p className="leading-[80px] whitespace-pre-wrap">01:30</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[179.5px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Margin />
        <TimerControls />
        <TimerDisplay />
      </div>
    </div>
  );
}

function SimulatingTheStateJustAfterLoggingASetWhereTheTimerSlidesUp() {
  return (
    <div className="absolute backdrop-blur-[10px] bg-[rgba(255,255,255,0.85)] bottom-0 content-stretch flex flex-col h-[353.59px] items-center justify-center left-0 pt-px right-0 rounded-tl-[32px] rounded-tr-[32px] z-[3]" data-name="Simulating the state just after logging a set, where the timer slides up">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.5)] border-solid border-t inset-0 pointer-events-none rounded-tl-[32px] rounded-tr-[32px] shadow-[0px_-8px_30px_0px_rgba(0,0,0,0.1)]" />
      <div className="absolute bg-[rgba(142,142,147,0.2)] h-[6px] left-[171px] rounded-[9999px] top-[17px] w-[48px]" data-name="Drag Handle" />
      <Container />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[7.4px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
        <g id="Container">
          <path d={svgPaths.p1adfde00} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMinimize() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button - Minimize">
      <Container3 />
    </div>
  );
}

function SetIndicators() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Set Indicators">
      <div className="bg-[#0647f9] h-[6px] rounded-[9999px] shrink-0 w-[32px]" data-name="Background" />
      <div className="bg-[rgba(142,142,147,0.2)] h-[6px] rounded-[9999px] shrink-0 w-[32px]" data-name="Overlay" />
      <div className="bg-[rgba(142,142,147,0.2)] h-[6px] rounded-[9999px] shrink-0 w-[32px]" data-name="Overlay" />
      <div className="bg-[rgba(142,142,147,0.2)] h-[6px] rounded-[9999px] shrink-0 w-[32px]" data-name="Overlay" />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[3.333px] relative shrink-0 w-[13.333px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 3.33333">
        <g id="Container">
          <path d={svgPaths.p1fea8500} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonSettings() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button - Settings">
      <Container4 />
    </div>
  );
}

function TopNavigationHeader() {
  return (
    <div className="relative shrink-0 w-full z-[2]" data-name="Top Navigation / Header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[16px] pt-[48px] px-[24px] relative w-full">
          <ButtonMinimize />
          <SetIndicators />
          <ButtonSettings />
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[40px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[32px] text-center tracking-[-0.64px] w-[279.3px]">
        <p className="leading-[40px] whitespace-pre-wrap">Barbell Back Squat</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p1c1607c0} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['JetBrains_Mono:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#8e8e93] text-[13px] text-center w-[101.41px]">
          <p className="leading-[19.5px] whitespace-pre-wrap">Last: 225 × 5</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-white content-stretch flex gap-[6px] items-center px-[13px] py-[5px] relative rounded-[9999px] shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e5e5ea] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] text-center w-[87.34px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Next: Pull Ups</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[7px] relative shrink-0 w-[4.317px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.31667 7">
        <g id="Container">
          <path d={svgPaths.p35022f90} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex gap-[4.01px] items-center pb-[4px] pt-[3px] px-[12px] relative rounded-[9999px] shrink-0" data-name="Button">
      <Container7 />
      <Container8 />
    </div>
  );
}

function HistoryPillNext() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="History Pill & Next">
      <BackgroundBorderShadow />
      <Button2 />
    </div>
  );
}

function ExerciseTitleBlock() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Exercise Title Block">
      <Heading />
      <HistoryPillNext />
    </div>
  );
}

function ExerciseTitleBlockMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] pt-[16px] relative shrink-0 w-full" data-name="Exercise Title Block:margin">
      <ExerciseTitleBlock />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[77px] justify-center leading-[0] not-italic relative shrink-0 text-[#0647f9] text-[64px] text-center tracking-[-1.28px] w-[113.64px]">
        <p className="leading-[normal] whitespace-pre-wrap">225</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <Container11 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container10 />
    </div>
  );
}

function Input() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Input">
      <Container9 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col h-[10px] items-start pt-[8px] relative shrink-0 w-[64px]" data-name="Margin">
      <div className="bg-[#0647f9] h-[2px] rounded-[9999px] shrink-0 w-[64px]" data-name="Horizontal Divider" />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#e5e5ea] content-stretch flex items-center justify-center pb-[2.5px] pt-[1.5px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] text-center w-[8.28px]">
        <p className="leading-[28px] whitespace-pre-wrap">-</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#e5e5ea] content-stretch flex items-center justify-center pb-[2.5px] pt-[1.5px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] text-center w-[11.92px]">
        <p className="leading-[28px] whitespace-pre-wrap">+</p>
      </div>
    </div>
  );
}

function QuickIncrementersSubtle() {
  return (
    <div className="absolute bottom-[16px] content-stretch flex gap-[16px] items-start left-[45.25px] opacity-0" data-name="Quick Incrementers (Subtle)">
      <Button3 />
      <Button4 />
    </div>
  );
}

function LeftInputWeight() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col h-[240px] items-center justify-center min-h-px min-w-px relative" data-name="Left Input: Weight">
      <Input />
      <Margin1 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[19.5px] justify-center leading-[0] left-[37.27px] not-italic text-[#8e8e93] text-[13px] top-[33.75px] tracking-[0.52px] uppercase w-[95.97px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Weight (Lbs)</p>
      </div>
      <QuickIncrementersSubtle />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[77px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[64px] text-center tracking-[-1.28px] w-[37.33px]">
        <p className="leading-[normal] whitespace-pre-wrap">5</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <Container14 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container13 />
    </div>
  );
}

function Input1() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Input">
      <Container12 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col h-[10px] items-start pt-[8px] relative shrink-0 w-[64px]" data-name="Margin">
      <div className="bg-[rgba(142,142,147,0.2)] h-[2px] opacity-0 rounded-[9999px] shrink-0 w-[64px]" data-name="Horizontal Divider" />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#e5e5ea] content-stretch flex items-center justify-center pb-[2.5px] pt-[1.5px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] text-center w-[8.28px]">
        <p className="leading-[28px] whitespace-pre-wrap">-</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#e5e5ea] content-stretch flex items-center justify-center pb-[2.5px] pt-[1.5px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Button">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] text-center w-[11.92px]">
        <p className="leading-[28px] whitespace-pre-wrap">+</p>
      </div>
    </div>
  );
}

function QuickIncrementersSubtle1() {
  return (
    <div className="absolute bottom-[16px] content-stretch flex gap-[16px] items-start left-[45.25px] opacity-0" data-name="Quick Incrementers (Subtle)">
      <Button5 />
      <Button6 />
    </div>
  );
}

function RightInputReps() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col h-[240px] items-center justify-center min-h-px min-w-px relative" data-name="Right Input: Reps">
      <Input1 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[19.5px] justify-center leading-[0] left-[67.7px] not-italic text-[#8e8e93] text-[13px] top-[33.75px] tracking-[0.52px] uppercase w-[35.09px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Reps</p>
      </div>
      <Margin2 />
      <QuickIncrementersSubtle1 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#e5e5ea] content-stretch flex gap-px items-start justify-center overflow-clip relative rounded-[16px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] shrink-0 w-full" data-name="Background+Shadow">
      <LeftInputWeight />
      <RightInputReps />
    </div>
  );
}

function TargetHelper() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Target Helper">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[23px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[15px] text-center w-[179.39px]">
        <p className="whitespace-pre-wrap">
          <span className="leading-[22.5px]">{`Target: `}</span>
          <span className="font-['Inter:Medium',sans-serif] font-medium leading-[22.5px] not-italic text-[#1c1c1e]">225 lbs</span>
          <span className="leading-[22.5px]">{` for `}</span>
          <span className="font-['Inter:Medium',sans-serif] font-medium leading-[22.5px] not-italic text-[#1c1c1e]">5 reps</span>
        </p>
      </div>
    </div>
  );
}

function TargetHelperMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[23px] relative shrink-0 w-full" data-name="Target Helper:margin">
      <TargetHelper />
    </div>
  );
}

function Flex1ToPushFooterDownFlexColJustifyCenterToCenterInputsVertically() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pb-[232px] pt-[136px] relative shrink-0 w-full" data-name="Flex-1 to push footer down, flex-col justify-center to center inputs vertically">
      <BackgroundShadow />
      <TargetHelperMargin />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[12.025px] relative shrink-0 w-[16.3px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3 12.025">
        <g id="Container">
          <path d={svgPaths.p2f7dfa00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#1c1c1e] content-stretch flex gap-[12px] h-[64px] items-center justify-center pb-[18.5px] pt-[17.5px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 right-0 rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-0" data-name="Button:shadow" />
      <Container15 />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[0.45px] w-[144.08px]">
        <p className="leading-[28px] whitespace-pre-wrap">COMPLETE SET</p>
      </div>
    </div>
  );
}

function StickyBottomAction() {
  return (
    <div className="absolute bottom-[32px] content-stretch flex flex-col items-start left-[24px] right-[24px]" data-name="Sticky Bottom Action">
      <Button7 />
    </div>
  );
}

function MainWorkoutContent() {
  return (
    <div className="relative shrink-0 w-full z-[1]" data-name="Main Workout Content">
      <div className="content-stretch flex flex-col items-start px-[24px] relative w-full">
        <ExerciseTitleBlockMargin />
        <Flex1ToPushFooterDownFlexColJustifyCenterToCenterInputsVertically />
        <StickyBottomAction />
      </div>
    </div>
  );
}

export default function LiveSession() {
  return (
    <div className="bg-[#f5f5f7] content-stretch flex flex-col isolate items-start relative size-full" data-name="Live Session">
      <SimulatingTheStateJustAfterLoggingASetWhereTheTimerSlidesUp />
      <TopNavigationHeader />
      <MainWorkoutContent />
    </div>
  );
}