import svgPaths from "./svg-z1i87rdu0v";
import imgUserProfilePictureShowingAYoungWoman from "figma:asset/5991b527c217bdc20ccc254d826d91a2563bc18a.png";
import { imgDecorativeSparklineBackground } from "./svg-epfov";

function Container1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p186f5ba0} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] w-[24.3px]">
        <p className="leading-[15px] whitespace-pre-wrap">Dash</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[64px]" data-name="Link">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Container">
          <path d={svgPaths.p2b6c7500} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[10px] w-[33.64px]">
        <p className="leading-[15px] whitespace-pre-wrap">Library</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[64px]" data-name="Link">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[18.025px] relative shrink-0 w-[18.525px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.525 18.025">
        <g id="Container">
          <path d={svgPaths.p3ce88680} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] w-[33.55px]">
        <p className="leading-[15px] whitespace-pre-wrap">Builder</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[64px]" data-name="Link">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #8E8E93)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[10px] w-[30.88px]">
        <p className="leading-[15px] whitespace-pre-wrap">Profile</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[64px]" data-name="Link">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[16px] pl-[24px] pr-[24.03px] relative w-full">
          <Link />
          <Link1 />
          <Link2 />
          <Link3 />
        </div>
      </div>
    </div>
  );
}

function BottomNavigationBar() {
  return (
    <div className="absolute backdrop-blur-[10px] bg-[rgba(245,245,247,0.85)] bottom-0 left-0 right-0 z-[4]" data-name="Bottom Navigation Bar">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-b border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px pt-[9px] relative w-full">
        <Container />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[16.333px] relative shrink-0 w-[12.833px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8333 16.3333">
        <g id="Container">
          <path d={svgPaths.pb76c620} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonActiveStateExampleCommentedOut() {
  return (
    <div className="bg-[#1c1c1e] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[56px]" data-name="Button - Active State Example (Commented out)">
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[9999px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[56px] top-0" data-name="Button - Active State Example (Commented out):shadow" />
      <Container9 />
    </div>
  );
}

function FloatingActionButton() {
  return (
    <div className="absolute bottom-[96px] right-[25px] z-[3]" data-name="Floating Action Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <ButtonActiveStateExampleCommentedOut />
      </div>
    </div>
  );
}

function UserProfilePictureShowingAYoungWoman() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[38px]" data-name="User profile picture showing a young woman">
      <div aria-hidden="true" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 pointer-events-none">
        <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUserProfilePictureShowingAYoungWoman} />
        </div>
        <div className="absolute bg-clip-padding bg-white border-0 border-[transparent] border-solid inset-0 mix-blend-saturation" />
      </div>
    </div>
  );
}

function UserAvatarProfile() {
  return (
    <div className="bg-[#e5e5ea] relative rounded-[9999px] shrink-0 size-[40px]" data-name="User Avatar / Profile">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <UserProfilePictureShowingAYoungWoman />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[23.333px] relative shrink-0 w-[23.45px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.45 23.3333">
        <g id="Container">
          <path d={svgPaths.p18be4c0} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonSettingsIcon() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button - Settings Icon">
      <Container11 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <UserAvatarProfile />
      <ButtonSettingsIcon />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1.205px] pb-[32px] relative shrink-0 w-full" data-name="Margin">
      <Container10 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1.205px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[39.6px] not-italic relative shrink-0 text-[#1c1c1e] text-[32px] tracking-[-0.9px] w-full whitespace-pre-wrap">
        <p className="mb-0">MONDAY,</p>
        <p>OCT 14</p>
      </div>
    </div>
  );
}

function HeaderSection() {
  return (
    <div className="bg-[#f5f5f7] relative shrink-0 w-[388px] z-[2]" data-name="Header Section">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[25.205px] pt-[48px] px-[24px] relative w-full">
        <Margin />
        <Heading />
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[96px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <div className="absolute inset-[14.19%_-5%_0_0]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 357 82.3771">
          <path d={svgPaths.p9e76300} fill="var(--fill-0, #0A0A20)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function DecorativeSparklineBackground() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col h-[96px] items-start justify-center left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0%_0px] mask-size-[100%_96px] opacity-10 right-0" data-name="Decorative Sparkline Background" style={{ maskImage: `url('${imgDecorativeSparklineBackground}')` }}>
      <Svg />
    </div>
  );
}

function DecorativeSparklineBackgroundMaskGroup() {
  return (
    <div className="absolute bottom-0 h-[96px] left-0 right-0" data-name="Decorative Sparkline Background:mask-group">
      <DecorativeSparklineBackground />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] tracking-[1.3px] uppercase w-[129.16px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Weekly Volume</p>
      </div>
      <div className="relative shrink-0 size-[13.333px]" data-name="Icon">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
          <path d={svgPaths.p20e55800} fill="var(--fill-0, #8E8E93)" fillOpacity="0.5" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[42px] tracking-[-1.05px] w-full">
        <p className="leading-[63px] whitespace-pre-wrap">12,450</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">lbs lifted</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function SectionWeeklyVolumeCard() {
  return (
    <div className="absolute bg-white left-[24px] right-[24px] rounded-[24px] top-0" data-name="Section - Weekly Volume Card">
      <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip p-[24px] relative rounded-[inherit] w-full">
        <DecorativeSparklineBackgroundMaskGroup />
        <Paragraph />
        <Container12 />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]" />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] tracking-[1.3px] uppercase w-[88.41px]">
        <p className="leading-[19.5px] whitespace-pre-wrap">Templates</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Container">
          <path d={svgPaths.p2bb32400} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container16 />
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative w-full">
          <Heading1 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(0,68,255,0.1)] content-stretch flex items-center px-[8px] py-[4px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#04f] text-[11px] tracking-[0.55px] uppercase w-[27.89px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Gym</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-[118px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative w-full">
        <Overlay />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 size-[19.8px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.8 19.8">
        <g id="Container">
          <path d={svgPaths.p2246b680} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container20 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] w-full">
        <p className="leading-[22.5px] whitespace-pre-wrap">Upper Power</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">45 min • Hypertrophy</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Container22 />
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-[118px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start relative w-full">
        <Overlay1 />
        <Container21 />
      </div>
    </div>
  );
}

function Card1Gym() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[200px] items-start justify-between left-0 p-[21px] rounded-[24px] top-0 w-[160px]" data-name="Card 1: Gym">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]" />
      <Container18 />
      <Container19 />
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(255,107,0,0.1)] content-stretch flex items-center px-[8px] py-[4px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#ff6b00] text-[11px] tracking-[0.55px] uppercase w-[27.56px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Cali</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 w-[118px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative w-full">
        <Overlay2 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[20px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="Container">
          <path d={svgPaths.p21ae1ac0} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container25 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] w-full">
        <p className="leading-[22.5px] whitespace-pre-wrap">Pull Day</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">30 min • Bodyweight</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Container27 />
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 w-[118px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start relative w-full">
        <Overlay3 />
        <Container26 />
      </div>
    </div>
  );
}

function Card2Calisthenics() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[200px] items-start justify-between left-[176px] p-[21px] rounded-[24px] top-0 w-[160px]" data-name="Card 2: Calisthenics">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]" />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Overlay4() {
  return (
    <div className="bg-[rgba(45,106,79,0.1)] content-stretch flex items-center px-[8px] py-[4px] relative rounded-[12px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#2d6a4f] text-[11px] tracking-[0.55px] uppercase w-[34.19px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Flow</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 w-[118px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative w-full">
        <Overlay4 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[16px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 16">
        <g id="Container">
          <path d={svgPaths.p9ab9180} fill="var(--fill-0, #1C1C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay5() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container30 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] w-full">
        <p className="leading-[22.5px] whitespace-pre-wrap">Mobility</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">20 min • Recovery</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading4 />
      <Container32 />
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0 w-[118px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[11px] items-start relative w-full">
        <Overlay5 />
        <Container31 />
      </div>
    </div>
  );
}

function Card3Flow() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[200px] items-start justify-between left-[352px] p-[21px] rounded-[24px] top-0 w-[160px]" data-name="Card 3: Flow">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]" />
      <Container28 />
      <Container29 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[216px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <Card1Gym />
      <Card2Calisthenics />
      <Card3Flow />
      <div className="absolute bottom-[16px] left-[528px] top-0 w-[8px]" data-name="Ghost Card for spacing" />
    </div>
  );
}

function SectionQuickStartTemplates() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 right-0 top-[203px]" data-name="Section - Quick Start / Templates">
      <Container15 />
      <Container17 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[13px] tracking-[1.3px] uppercase w-full">
        <p className="leading-[19.5px] whitespace-pre-wrap">Recent</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[10.021px] relative shrink-0 w-[13.583px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5833 10.0208">
        <g id="Container">
          <path d={svgPaths.p127da640} fill="var(--fill-0, #0044FF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay6() {
  return (
    <div className="bg-[rgba(0,68,255,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[14px] w-[101.28px]">
        <p className="leading-[20px] whitespace-pre-wrap">Leg Day Heavy</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-[107.91px]">
        <p className="leading-[16px] whitespace-pre-wrap">Yesterday • 1h 12m</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container37 />
      <Container38 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Overlay6 />
      <Container36 />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[12px] w-[64.81px]">
        <p className="leading-[16px] whitespace-pre-wrap">14,200 lb</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative w-full">
          <Container34 />
          <Container39 />
        </div>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[10.021px] relative shrink-0 w-[13.583px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5833 10.0208">
        <g id="Container">
          <path d={svgPaths.p127da640} fill="var(--fill-0, #FF6B00)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay7() {
  return (
    <div className="bg-[rgba(255,107,0,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container41 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#1c1c1e] text-[14px] w-[61.72px]">
        <p className="leading-[20px] whitespace-pre-wrap">Ring Skill</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#8e8e93] text-[12px] w-[93.09px]">
        <p className="leading-[16px] whitespace-pre-wrap">Fri, Oct 11 • 45m</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container43 />
      <Container44 />
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Overlay7 />
        <Container42 />
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['JetBrains_Mono:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#1c1c1e] text-[12px] w-[14.41px]">
          <p className="leading-[16px] whitespace-pre-wrap">BW</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[16px] pt-[17px] px-[16px] relative w-full">
          <Container40 />
          <Container45 />
        </div>
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] shrink-0 w-full" data-name="Background+Shadow">
      <Container33 />
      <HorizontalBorder />
    </div>
  );
}

function RecentHistorySection() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 px-[24px] right-0 top-[490px]" data-name="Recent History Section">
      <Heading5 />
      <BackgroundShadow />
    </div>
  );
}

function MainScrollableContent() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[388px] z-[1]" data-name="Main Scrollable Content">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <SectionWeeklyVolumeCard />
        <SectionQuickStartTemplates />
        <RecentHistorySection />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="bg-[#f5f5f7] relative size-full" data-name="Dashboard">
      <div className="content-stretch flex flex-col isolate items-start max-w-[inherit] px-px relative size-full">
        <BottomNavigationBar />
        <FloatingActionButton />
        <HeaderSection />
        <MainScrollableContent />
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e5ea] border-l border-r border-solid inset-0 pointer-events-none shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}