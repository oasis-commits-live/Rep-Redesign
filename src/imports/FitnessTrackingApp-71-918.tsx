import svgPaths from "./svg-zmew8pir7b";
import imgImageProfile from "figma:asset/a1d45ddbe2214e0855f87ed9fe22138d5a2c05c3.png";

function Heading() {
  return (
    <div className="absolute h-[47.979px] left-[23.99px] top-[48px] w-[391.473px]" data-name="Heading 1">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[48px] left-0 not-italic text-[#1c1c1e] text-[32px] top-[-0.59px] tracking-[-0.32px]">Profile</p>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[29.995px] relative shrink-0 w-[60.421px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[30px] left-0 not-italic text-[#1c1c1e] text-[20px] top-[-0.8px]">Ayush</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.991 13.991">
        <g id="Icon">
          <path d="M6.9955 11.6592H12.2421" id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16592" />
          <path d={svgPaths.p3b56fb80} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16592" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] relative rounded-[12px] shrink-0 size-[27.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[7.985px] h-[29.995px] items-center relative shrink-0 w-full" data-name="Container">
      <Text />
      <Button />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.1px]">Cali • 0 workouts</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[1.996px] h-[51.472px] items-start left-[95.98px] top-[18px] w-[295.497px]" data-name="Container">
      <Container4 />
      <Paragraph />
    </div>
  );
}

function ImageProfile() {
  return (
    <div className="absolute left-0 size-[79.988px] top-0" data-name="Image (Profile)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageProfile} />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.991 13.991">
        <g clipPath="url(#clip0_72_945)" id="Icon">
          <path d={svgPaths.pc709080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16592" />
          <path d={svgPaths.p1c34ee80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16592" />
        </g>
        <defs>
          <clipPath id="clip0_72_945">
            <rect fill="white" height="13.991" width="13.991" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[#34c759] content-stretch flex items-center justify-center left-[51.99px] p-[2.203px] rounded-[36956300px] size-[27.999px] top-[51.99px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.203px] border-solid border-white inset-0 pointer-events-none rounded-[36956300px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.2)]" />
      <Icon1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] left-0 size-[79.988px] top-0" data-name="Container">
      <Container6 />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[36956300px] size-[79.988px] top-0" data-name="Button">
      <ImageProfile />
      <Container5 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[87.474px] left-[23.99px] top-[119.96px] w-[391.473px]" data-name="Container">
      <Container3 />
      <Button1 />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-full" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.1px] tracking-[1.3px] uppercase">Weekly Activity</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[36.001px] left-0 top-0 w-[351.479px]" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[36px] left-0 text-[#19191b] text-[36px] top-[-0.61px] tracking-[-0.9px]">0</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[60.008px] relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[37.41px]">minutes this week</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[4.47%_3.42%_18.89%_0]" data-name="Group">
      <div className="absolute inset-[-0.36%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 338.976 138.941">
          <g id="Group">
            <path d="M35.9927 138.441H338.976" id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeDasharray="3 3" strokeOpacity="0.1" strokeWidth="0.999944" />
            <path d="M0 103.5H322" id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeDasharray="3 3" strokeOpacity="0.1" strokeWidth="0.999944" />
            <path d="M0 69.5H322" id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeDasharray="3 3" strokeOpacity="0.1" strokeWidth="0.999944" />
            <path d="M0 34.5H322" id="Vector_4" stroke="var(--stroke-0, #8E8E93)" strokeDasharray="3 3" strokeOpacity="0.1" strokeWidth="0.999944" />
            <path d="M0 0.499972H322" id="Vector_5" stroke="var(--stroke-0, #8E8E93)" strokeDasharray="3 3" strokeOpacity="0.1" strokeWidth="0.999944" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[4.47%_3.42%_18.89%_0]" data-name="Group">
      <Group1 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[86.17%_94.58%_7.17%_0]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[86.17%_94.58%_7.17%_0] leading-[normal] not-italic text-[#727272] text-[9.999px] text-center">Dec</p>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[86.17%_62.39%_7.17%_32.77%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[86.17%_62.39%_7.17%_32.77%] leading-[normal] not-italic text-[#727272] text-[9.999px] text-center">Jan</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents inset-[86.17%_29.91%_7.17%_64.96%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[86.17%_29.91%_7.17%_64.96%] leading-[normal] not-italic text-[#727272] text-[9.999px] text-center">Feb</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[86.17%_29.91%_7.17%_0]" data-name="Group">
      <Group4 />
      <Group5 />
      <Group6 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[86.17%_29.91%_7.17%_0]" data-name="Group">
      <Group3 />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents font-['Inter:Regular',sans-serif] font-normal inset-[58.72%_0.28%_16.61%_94.31%] leading-[normal] not-italic text-[#727272] text-[8.999px] text-right" data-name="Group">
      <p className="absolute inset-[58.72%_0.28%_35.17%_94.31%]">0.5h</p>
      <p className="absolute inset-[77.28%_0.28%_16.61%_96.59%]">0h</p>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents inset-[39.55%_0_54.34%_97.16%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[39.55%_0_54.34%_97.16%] leading-[normal] not-italic text-[#727272] text-[8.999px] text-right">1h</p>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents inset-[20.39%_0.28%_73.5%_94.88%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[20.39%_0.28%_73.5%_94.88%] leading-[normal] not-italic text-[#727272] text-[8.999px] text-right">1.5h</p>
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents inset-[1.22%_0_92.67%_96.87%]" data-name="Group">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[1.22%_0_92.67%_96.87%] leading-[normal] not-italic text-[#727272] text-[8.999px] text-right">2h</p>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents inset-[1.22%_0_16.61%_94.31%]" data-name="Group">
      <Group9 />
      <Group10 />
      <Group11 />
      <Group12 />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents inset-[1.22%_0_16.61%_94.31%]" data-name="Group">
      <Group8 />
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute inset-[81.14%_7.4%_18.86%_0]" data-name="Group">
      <div className="absolute inset-[-1.25px_-0.38%_-1.25px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 326.25 2.49989">
          <g id="Group">
            <path d={svgPaths.p16a5c980} fill="var(--stroke-0, #34C759)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Surface() {
  return (
    <div className="absolute h-[179.99px] left-0 overflow-clip top-0 w-[350.997px]" data-name="Surface">
      <Group />
      <Group2 />
      <Group7 />
      <Group13 />
    </div>
  );
}

function LineChart() {
  return (
    <div className="h-[179.99px] relative shrink-0 w-full" data-name="LineChart">
      <Surface />
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-white h-[295.979px] relative rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[15.987px] items-start pt-[19.997px] px-[19.997px] relative size-full">
        <Container9 />
        <LineChart />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.995px] h-[327.455px] items-start left-[23.99px] top-[239.43px] w-[391.473px]" data-name="Container">
      <Text1 />
      <Container8 />
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-full" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.1px] tracking-[1.3px] uppercase">All-Time Stats</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[15.99px] size-[15.987px] top-[15.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9873 15.9873">
        <g clipPath="url(#clip0_72_939)" id="Icon">
          <path d={svgPaths.p7029200} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
        </g>
        <defs>
          <clipPath id="clip0_72_939">
            <rect fill="white" height="15.9873" width="15.9873" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[36.001px] left-[15.99px] top-[39.96px] w-[157.756px]" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[36px] left-0 text-[#19191b] text-[24px] top-[-0.9px] tracking-[-0.6px]">0</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[17.984px] left-[15.99px] top-[77.96px] w-[157.756px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#727272] text-[12px] top-[0.1px]">Workouts</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bg-white h-[111.928px] left-0 rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] top-0 w-[189.73px]" data-name="Container">
      <Icon2 />
      <Container14 />
      <Container15 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[15.99px] size-[15.987px] top-[15.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9873 15.9873">
        <g clipPath="url(#clip0_72_935)" id="Icon">
          <path d={svgPaths.p360d4b80} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.p278e0c20} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
        </g>
        <defs>
          <clipPath id="clip0_72_935">
            <rect fill="white" height="15.9873" width="15.9873" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[36.001px] left-[15.99px] top-[39.96px] w-[157.773px]" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[36px] left-0 text-[#19191b] text-[24px] top-[-0.9px] tracking-[-0.6px]">0</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[17.984px] left-[15.99px] top-[77.96px] w-[157.773px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#727272] text-[12px] top-[0.1px]">Total Reps</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-white h-[111.928px] left-[201.73px] rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] top-0 w-[189.748px]" data-name="Container">
      <Icon3 />
      <Container17 />
      <Container18 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[15.99px] size-[15.987px] top-[15.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9873 15.9873">
        <g clipPath="url(#clip0_72_924)" id="Icon">
          <path d={svgPaths.paec2e00} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.pa010a00} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.p132df780} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.p2d28f080} id="Vector_4" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.pe680480} id="Vector_5" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
        </g>
        <defs>
          <clipPath id="clip0_72_924">
            <rect fill="white" height="15.9873" width="15.9873" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[36.001px] left-[15.99px] top-[39.96px] w-[157.756px]" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[36px] left-0 text-[#19191b] text-[24px] top-[-0.9px] tracking-[-0.6px]">0</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[17.984px] left-[15.99px] top-[77.96px] w-[157.756px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#727272] text-[12px] top-[0.1px]">Total Sets</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute bg-white h-[111.928px] left-0 rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] top-[123.92px] w-[189.73px]" data-name="Container">
      <Icon4 />
      <Container20 />
      <Container21 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[15.99px] size-[15.987px] top-[15.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9873 15.9873">
        <g clipPath="url(#clip0_72_931)" id="Icon">
          <path d={svgPaths.p2a223040} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.p3081c980} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
        </g>
        <defs>
          <clipPath id="clip0_72_931">
            <rect fill="white" height="15.9873" width="15.9873" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[36.001px] left-[15.99px] top-[39.96px] w-[157.773px]" data-name="Container">
      <p className="absolute font-['JetBrains_Mono:Medium',sans-serif] font-medium leading-[36px] left-0 text-[#19191b] text-[24px] top-[-0.9px] tracking-[-0.6px]">0</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[17.984px] left-[15.99px] top-[77.96px] w-[157.773px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#727272] text-[12px] top-[0.1px]">Minutes Trained</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute bg-white h-[111.928px] left-[201.73px] rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] top-[123.92px] w-[189.748px]" data-name="Container">
      <Icon5 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[235.851px] relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container16 />
      <Container19 />
      <Container22 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.995px] h-[267.326px] items-start left-[23.99px] top-[598.88px] w-[391.473px]" data-name="Container">
      <Text2 />
      <Container12 />
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-[121.135px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.1px] tracking-[1.3px] uppercase">February 2026</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-[81.52px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[0] left-0 not-italic text-[#1c1c1e] text-[0px] text-[13px] top-[0.1px]">
          <span className="leading-[19.5px]">{`0 `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] text-[#8e8e93]">days active</span>
        </p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex h-[19.481px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Text3 />
      <Text4 />
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute h-[14.989px] left-0 top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[24.05px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">M</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[14.989px] left-[52.21px] top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[23.34px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">T</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[14.989px] left-[104.42px] top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[23.09px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">W</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[14.989px] left-[156.64px] top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[23.34px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">T</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute h-[14.989px] left-[208.85px] top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[23.15px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">F</p>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute h-[14.989px] left-[261.06px] top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[23.38px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">S</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute h-[14.989px] left-[313.27px] top-0 w-[46.224px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-[23.38px] not-italic text-[#8e8e93] text-[10px] text-center top-[0.1px]">S</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[14.989px] relative shrink-0 w-full" data-name="Container">
      <Container29 />
      <Container30 />
      <Container31 />
      <Container32 />
      <Container33 />
      <Container34 />
      <Container35 />
    </div>
  );
}

function Container37() {
  return <div className="absolute h-[29.995px] left-0 top-0 w-[46.224px]" data-name="Container" />;
}

function Container38() {
  return <div className="absolute h-[29.995px] left-[52.21px] top-0 w-[46.224px]" data-name="Container" />;
}

function Container39() {
  return <div className="absolute h-[29.995px] left-[104.42px] top-0 w-[46.224px]" data-name="Container" />;
}

function Container40() {
  return <div className="absolute h-[29.995px] left-[156.64px] top-0 w-[46.224px]" data-name="Container" />;
}

function Container41() {
  return <div className="absolute h-[29.995px] left-[208.85px] top-0 w-[46.224px]" data-name="Container" />;
}

function Container42() {
  return <div className="absolute h-[29.995px] left-[261.06px] top-0 w-[46.224px]" data-name="Container" />;
}

function Container44() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">1</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[313.27px] pr-[0.017px] top-0 w-[46.224px]" data-name="Container">
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">2</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-0 pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container46 />
    </div>
  );
}

function Container48() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">3</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[52.21px] pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container48 />
    </div>
  );
}

function Container50() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">4</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[104.42px] pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container50 />
    </div>
  );
}

function Container52() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">5</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[156.64px] pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container52 />
    </div>
  );
}

function Container54() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">6</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[208.85px] pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">7</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[261.06px] pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container56 />
    </div>
  );
}

function Container58() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">8</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[313.27px] pr-[0.017px] top-[35.98px] w-[46.224px]" data-name="Container">
      <Container58 />
    </div>
  );
}

function Container60() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">9</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-0 pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container60 />
    </div>
  );
}

function Container62() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">10</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[52.21px] pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container62 />
    </div>
  );
}

function Container64() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">11</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[104.42px] pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container64 />
    </div>
  );
}

function Container66() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">12</p>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[156.64px] pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container66 />
    </div>
  );
}

function Container68() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">13</p>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[208.85px] pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container68 />
    </div>
  );
}

function Container70() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">14</p>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[261.06px] pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container70 />
    </div>
  );
}

function Container72() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">15</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[313.27px] pr-[0.017px] top-[71.97px] w-[46.224px]" data-name="Container">
      <Container72 />
    </div>
  );
}

function Container74() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">16</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-0 pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container74 />
    </div>
  );
}

function Container76() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">17</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[52.21px] pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container76 />
    </div>
  );
}

function Container78() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">18</p>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[104.42px] pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container78 />
    </div>
  );
}

function Container80() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">19</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[156.64px] pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container80 />
    </div>
  );
}

function Container82() {
  return (
    <div className="bg-[rgba(142,142,147,0.08)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#8e8e93] text-[11px]">20</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[208.85px] pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container82 />
    </div>
  );
}

function Container84() {
  return (
    <div className="bg-[rgba(52,199,89,0.12)] relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] not-italic relative shrink-0 text-[#34c759] text-[11px]">21</p>
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[261.06px] pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container84 />
    </div>
  );
}

function Container86() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">22</p>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[313.27px] pr-[0.017px] top-[107.95px] w-[46.224px]" data-name="Container">
      <Container86 />
    </div>
  );
}

function Container88() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">23</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-0 pr-[0.017px] top-[143.94px] w-[46.224px]" data-name="Container">
      <Container88 />
    </div>
  );
}

function Container90() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">24</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[52.21px] pr-[0.017px] top-[143.94px] w-[46.224px]" data-name="Container">
      <Container90 />
    </div>
  );
}

function Container92() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">25</p>
      </div>
    </div>
  );
}

function Container91() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[104.42px] pr-[0.017px] top-[143.94px] w-[46.224px]" data-name="Container">
      <Container92 />
    </div>
  );
}

function Container94() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">26</p>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[156.64px] pr-[0.017px] top-[143.94px] w-[46.224px]" data-name="Container">
      <Container94 />
    </div>
  );
}

function Container96() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">27</p>
      </div>
    </div>
  );
}

function Container95() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[208.85px] pr-[0.017px] top-[143.94px] w-[46.224px]" data-name="Container">
      <Container96 />
    </div>
  );
}

function Container98() {
  return (
    <div className="relative rounded-[36956300px] shrink-0 size-[29.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[11px]">28</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="absolute content-stretch flex h-[29.995px] items-center justify-center left-[261.06px] pr-[0.017px] top-[143.94px] w-[46.224px]" data-name="Container">
      <Container98 />
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[173.932px] relative shrink-0 w-full" data-name="Container">
      <Container37 />
      <Container38 />
      <Container39 />
      <Container40 />
      <Container41 />
      <Container42 />
      <Container43 />
      <Container45 />
      <Container47 />
      <Container49 />
      <Container51 />
      <Container53 />
      <Container55 />
      <Container57 />
      <Container59 />
      <Container61 />
      <Container63 />
      <Container65 />
      <Container67 />
      <Container69 />
      <Container71 />
      <Container73 />
      <Container75 />
      <Container77 />
      <Container79 />
      <Container81 />
      <Container83 />
      <Container85 />
      <Container87 />
      <Container89 />
      <Container91 />
      <Container93 />
      <Container95 />
      <Container97 />
    </div>
  );
}

function Container27() {
  return (
    <div className="bg-white h-[228.881px] relative rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[7.985px] items-start pt-[15.987px] px-[15.987px] relative size-full">
        <Container28 />
        <Container36 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.995px] h-[260.357px] items-start left-[23.99px] top-[890.19px] w-[391.473px]" data-name="Container">
      <Container26 />
      <Container27 />
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-full" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.1px] tracking-[1.3px] uppercase">Saved Routines</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[21.012px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#8e8e93] text-[14px] top-[0.2px]">2 templates</p>
    </div>
  );
}

function Container99() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.985px] h-[48.478px] items-start left-[23.99px] top-[1182.54px] w-[391.473px]" data-name="Container">
      <Text5 />
      <Paragraph1 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[15.987px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9873 15.9873">
        <g id="Icon">
          <path d={svgPaths.p15141060} id="Vector" stroke="var(--stroke-0, #FF3B30)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d={svgPaths.p93cf280} id="Vector_2" stroke="var(--stroke-0, #FF3B30)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
          <path d="M13.9888 7.99363H5.99522" id="Vector_3" stroke="var(--stroke-0, #FF3B30)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
        </g>
      </svg>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[22.51px] relative shrink-0 w-[61.385px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.5px] left-0 not-italic text-[#ff3b30] text-[15px] top-[-0.8px]">Sign Out</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[11.995px] h-[50.492px] items-center left-[23.99px] overflow-clip pl-[15.987px] rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] top-[1263.01px] w-[391.473px]" data-name="Button">
      <Icon6 />
      <Text6 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[17.984px] left-0 opacity-40 top-0 w-[391.473px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-[195.94px] not-italic text-[#8e8e93] text-[12px] text-center top-[0.1px]">Rep v1.0</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[17.984px] left-0 opacity-30 top-[17.98px] w-[391.473px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-[195.85px] not-italic text-[#8e8e93] text-[12px] text-center top-[0.1px]">Make your effort visible.</p>
    </div>
  );
}

function Container100() {
  return (
    <div className="absolute h-[35.967px] left-[23.99px] top-[1345.49px] w-[391.473px]" data-name="Container">
      <Paragraph2 />
      <Paragraph3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[1493.457px] relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container2 />
      <Container7 />
      <Container11 />
      <Container25 />
      <Container99 />
      <Button2 />
      <Container100 />
    </div>
  );
}

function Container101() {
  return <div className="h-[15.987px] shrink-0 w-full" data-name="Container" />;
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[878.008px] items-start left-0 overflow-clip top-0 w-[439.452px]" data-name="Container">
      <Container1 />
      <Container101 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[23.989px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_58.33%_58.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-11.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.59623 8.59623">
            <path d={svgPaths.p36344980} id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_12.5%_58.33%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-11.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.59623 8.59623">
            <path d={svgPaths.p36344980} id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_12.5%_12.5%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-11.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.59623 8.59623">
            <path d={svgPaths.p36344980} id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_58.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-11.43%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.59623 8.59623">
            <path d={svgPaths.p36344980} id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[42.94px] size-[23.989px] top-[27px]" data-name="Container">
      <Icon7 />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute h-[77.992px] left-0 top-0 w-[109.863px]" data-name="Button">
      <Container103 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[23.989px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[12.5%] left-1/2 right-1/2 top-[29.17%]" data-name="Vector">
        <div className="absolute inset-[-5.71%_-0.8px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.5993 15.5932">
            <path d="M0.79965 0.79965V14.7935" id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-4.44%_-4%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.5905 19.5914">
            <path d={svgPaths.p2bff8e00} id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[42.94px] size-[23.989px] top-[27px]" data-name="Container">
      <Icon8 />
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute h-[77.992px] left-[109.86px] top-0 w-[109.863px]" data-name="Button">
      <Container104 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[23.989px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.32%_8.32%_12.49%_12.49%]" data-name="Vector">
        <div className="absolute inset-[-4.21%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5959 20.5959">
            <path d={svgPaths.p26a4bc70} id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5993" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[42.94px] size-[23.989px] top-[27px]" data-name="Container">
      <Icon9 />
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute h-[77.992px] left-[219.73px] top-0 w-[109.863px]" data-name="Button">
      <Container105 />
    </div>
  );
}

function Container106() {
  return <div className="absolute bg-[rgba(255,255,255,0)] left-[28.93px] rounded-[10px] shadow-[0px_0px_20px_0px_rgba(52,199,89,0.3)] size-[51.989px] top-[12.99px]" data-name="Container" />;
}

function Icon10() {
  return (
    <div className="h-[25.189px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_20.83%_12.5%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-18.33%_-7.85%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.009 8.60622">
            <path d={svgPaths.p3df58a80} id="Vector" stroke="var(--stroke-0, #34C759)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.30899" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_33.33%_54.17%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-13.75%_-13.74%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.709 10.7053">
            <path d={svgPaths.p22799040} id="Vector" stroke="var(--stroke-0, #34C759)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.30899" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[42.34px] size-[25.2px] top-[26.4px]" data-name="Container">
      <Icon10 />
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute h-[77.992px] left-[329.59px] top-0 w-[109.863px]" data-name="Button">
      <Container106 />
      <Container107 />
    </div>
  );
}

function Container102() {
  return (
    <div className="absolute bg-[#f5f5f7] h-[77.992px] left-0 shadow-[0px_-8px_40px_0px_rgba(0,0,0,0.06),0px_-2px_12px_0px_rgba(0,0,0,0.03)] top-[878.01px] w-[439.452px]" data-name="Container">
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
    </div>
  );
}

export default function FitnessTrackingApp() {
  return (
    <div className="bg-[#f5f5f7] relative size-full" data-name="Fitness Tracking App">
      <Container />
      <Container102 />
    </div>
  );
}