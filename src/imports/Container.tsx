import svgPaths from "./svg-a2v62vexac";

function Text() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-[88.386px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.1px] tracking-[1.3px] uppercase">Templates</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[13.991px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-0.58px_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.32733 1.16592">
            <path d="M0.582958 0.582958H8.74437" id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16592" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[20.83%] left-1/2 right-1/2 top-[20.83%]" data-name="Vector">
        <div className="absolute inset-[-7.14%_-0.58px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.16592 9.32733">
            <path d="M0.582958 0.582958V8.74437" id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16592" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[19.481px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[23.989px] pr-[23.99px] relative size-full">
          <Text />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[rgba(6,71,249,0.1)] h-[24.471px] relative rounded-[12px] shrink-0 w-[43.832px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16.5px] left-[7.99px] not-italic text-[#0647f9] text-[11px] top-[4.09px] tracking-[0.55px] uppercase">Gym</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.987px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9873 15.9873">
        <g id="Icon">
          <path d={svgPaths.p3f63a300} fill="var(--fill-0, #1C1C1E)" id="Vector" stroke="var(--stroke-0, #1C1C1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33227" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[rgba(229,229,234,0.5)] relative rounded-[36956300px] shrink-0 size-[39.994px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.979px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[27.001px] left-0 overflow-clip top-0 w-[118.003px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] left-0 not-italic text-[#1c1c1e] text-[18px] top-[0.2px]">Overkill</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[17.984px] left-0 top-[27px] w-[118.003px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.1px]">43 min • 5 exercises</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[44.985px] relative shrink-0 w-[118.003px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container6 />
        <Container7 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-full relative rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] shrink-0 w-[159.993px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24.058px] items-start pl-[20.995px] py-[20px] relative size-full">
        <Container3 />
        <Container4 />
        <Container5 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[199.987px] relative shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start pl-[23.989px] relative size-full">
          <Button1 />
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#f5f5f7] content-stretch flex flex-col gap-[15.987px] items-start py-[12px] relative size-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}