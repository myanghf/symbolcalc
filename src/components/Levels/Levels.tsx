import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { useMediaQuery } from "react-responsive";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineInfo } from "react-icons/md";
import dayjs from "dayjs";
import "./Levels.css";

interface Props {
  symbols: [
    {
      name: string;
      img: string;
      alt: string;
      type: string;
      level: number;
      extra: boolean;
      daily: ConstrainBooleanParameters;
      dailySymbols: number;
      weekly: boolean;
      experience: number;
      symbolsRemaining: number;
      daysRemaining: number;
      completion: string;
      symbolsRequired: Array<number>;
    }
  ];
  swapped: boolean;
}

const Levels = ({ symbols, swapped }: Props) => {
  const isMobile = useMediaQuery({ query: `(max-width: 799px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });
  const [targetSymbol, setTargetSymbol] = useState(0);
  const [targetLevel, setTargetLevel] = useState(NaN);
  const [targetDays, setTargetDays] = useState(NaN);
  const [selectedNone, setSelectedNone] = useState(true);
  const [levelSet, setLevelSet] = useState(false);

  const currentSymbol = symbols[targetSymbol];

  const dailySymbols = currentSymbol.daily
    ? currentSymbol.dailySymbols *
      (currentSymbol.extra ? (currentSymbol.type === "arcane" ? 2 : 1.5) : 1)
    : 0;

    const targetSymbols =
    currentSymbol?.symbolsRequired
      .slice(currentSymbol.level, targetLevel)
      .reduce((accumulator, experience) => accumulator + experience, 0) -
    currentSymbol.experience;
      

  useMemo(() => {
    try {
      let days = 0;
      let count = 0;
      let resets = 0;
      let mondayReached = false;
      for (let i = 0; i < 1000; i++) {
        if (
          days * dailySymbols + (currentSymbol.weekly ? resets * 45 : 0) <
          targetSymbols
        ) {
          if (
            // ? Should this be a while loop? while monday false
            mondayReached === false &&
            dayjs().add(count, "day").isBefore(dayjs().day(8))
          ) {
            count++;
            if (dayjs().add(count, "day").isSame(dayjs().day(8))) {
              //resets++; // ? Should the 'Weekly Done' toggle be included?
              mondayReached = true;
            }
          } else if ((days - count) % 7 === 0) {
            resets++;
          }
          days++;
        }
      }
      setTargetDays(days);
    } catch (e) {
      ////console.log(e as Error);
    }
  }, [
    targetLevel,
    currentSymbol.level,
    currentSymbol.experience,
    currentSymbol.weekly,
    currentSymbol.daily,
    currentSymbol.extra,
  ]);

  const targetDate = dayjs()
    .add(targetDays, "day")
    .format("YYYY-MM-DD")
    .toString();

  useEffect(() => {
    setSelectedNone(true);
  }, [swapped]);

  useMemo(() => {
    setLevelSet(false);
  }, [targetSymbol, selectedNone]);

  useEffect(() => {
    if (
      isNaN(currentSymbol.level) ||
      currentSymbol.level === (!swapped ? 20 : 11)
    )
      setSelectedNone(true);
  }, [currentSymbol.level]);

  const newAgeCheck = (
    completionDate: string,
    name: string,
    level: number,
    daily: boolean,
    weekly: boolean
  ) => {
    if (
      name != "Hotel Arcus" &&
      level !== (!swapped ? 20 : 11) &&
      !isNaN(level) &&
      (daily || weekly)
    )
      return dayjs(completionDate).isAfter(dayjs("2053-11-14")); // DISABLED TEMPORARILY
  };

  return (
    <section className="levels">
      <div className="flex justify-center items-center bg-gradient-to-t from-card to-card-grad rounded-lg w-[350px] tablet:w-[700px] laptop:w-[1050px] p-10 mt-16 tablet:mt-28">
        <div className="flex flex-col w-[350px] tablet:w-[700px] laptop:w-[1050px]">
          <div className="hidden items-center text-center text-tertiary tablet:flex">
            <div className="w-1/5 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild={true} >
              {" "}
                  <HiOutlineQuestionMarkCircle size={30} className="cursor-default transition-all hover:stroke-white"/>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                View the <span>individual level</span> requirements <br></br>and dates
                for each symbol
              </TooltipContent>
            </Tooltip>
            </div>
            <p className="w-1/5 tracking-wider">Symbol</p>
            <p className="w-1/5 tracking-wider">Target Level</p>
            <p className="w-1/5 tracking-wider">Completion Date</p>
            <p className="w-1/5 tracking-wider">Symbols Remaining</p>
          </div>
          <div className="flex justify-center items-center text-center text-tertiary tablet:hidden">
            <h1 className="tracking-wider">Symbol Overview</h1>
          </div>
          <hr className="horizontal-divider" />
          {symbols.map(
            (symbol, index) =>
              symbol.type === (!swapped ? "arcane" : "sacred") && (
                <div
                  key={index}
                  className={`${
                    targetSymbol === index &&
                    selectedNone === false &&
                    symbol.level < (!swapped ? 20 : 11) &&
                    "rounded-3xl shadow-level shadow-accent z-10 "
                  }`}
                >
                  <div
                    onClick={() => {
                      setTargetSymbol(index);
                      setTargetLevel(NaN);
                      targetSymbol === index
                        ? setSelectedNone(!selectedNone)
                        : setSelectedNone(false);
                    }}
                    className={`flex justify-between px-4 tablet:px-0 tablet:justify-normal items-center text-center hover:bg-dark cursor-pointer py-4 ${
                      (isNaN(symbol.level) || symbol.level === null) &&
                      "opacity-25 pointer-events-none"
                    } ${
                      symbol.level === (!swapped ? 20 : 11) &&
                      "pointer-events-none"
                    } ${
                      targetSymbol === index &&
                      selectedNone === false &&
                      symbol.level < (!swapped ? 20 : 11)
                        ? "bg-dark hover:bg-gradient-to-b hover:from-light rounded-t-3xl"
                        : "rounded-3xl"
                    }`}
                  >
                    <div className="hidden tablet:flex w-1/4 justify-center">
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        width={40}
                        className={`${
                          (isNaN(symbol.level) || symbol.level === null) &&
                          "filter grayscale"
                        }`}
                      ></img>
                    </div>
                    <div className="flex tablet:hidden justify-center">
                      <img
                        src={symbol.img}
                        alt={symbol.alt}
                        width={37.5}
                        className={`${
                          (isNaN(symbol.level) || symbol.level === null) &&
                          "filter grayscale"
                        }`}
                      ></img>
                    </div>
                    <p className="tablet:w-1/4 tracking-wider text-center">
                      {symbol.name}
                    </p>
                    <IoMdArrowDropdown
                      size={25}
                      className={`block tablet:hidden w-[37.5px] ${
                        symbol.level === (!swapped ? 20 : 11) && "hidden"
                      }`}
                    ></IoMdArrowDropdown>
                    <p
                      className={`w-[37.5px] text-accent ${
                        symbol.level === (!swapped ? 20 : 11) && isMobile
                          ? "block"
                          : "hidden"
                      }`}
                    >
                      MAX
                    </p>
                    <p
                      className={`tablet:w-1/4 hidden tablet:block ${
                        isNaN(symbol.level) || symbol.level === null
                          ? "filter grayscale"
                          : "text-accent"
                      }`}
                    >
                      {symbol.level === (!swapped ? 20 : 11)
                        ? "MAX"
                        : isNaN(symbol.level) || symbol.level === null
                        ? "0"
                        : !swapped
                        ? 20
                        : 11}
                    </p>
                    <div className="tablet:w-1/4 hidden tablet:block">
                      <p>
                        {symbol.level === (!swapped ? 20 : 11) ||
                        isNaN(symbol.level) ||
                        symbol.level === null
                          ? "‎"
                          : symbol.completion === "Invalid Date" ||
                            (!symbol.daily && !symbol.weekly) ||
                            isNaN(symbol.experience) ||
                            symbol.experience === null
                          ? "Indefinite"
                          : symbol.daysRemaining === 0
                          ? "Complete"
                          : symbol.completion}
                      </p>
                      <div className="flex justify-center items-center space-x-1">
                        <p className="text-tertiary">
                          {symbol.level === (!swapped ? 20 : 11) ||
                          isNaN(symbol.level) ||
                          symbol.level === null
                            ? "‎"
                            : String(symbol.daysRemaining) === "Infinity" ||
                              isNaN(symbol.daysRemaining) ||
                              (!symbol.daily && !symbol.weekly) ||
                              isNaN(symbol.experience) ||
                              symbol.experience === null
                            ? "? days"
                            : symbol.daysRemaining === 0
                            ? "Ready for upgrade"
                            : symbol.daysRemaining > 1
                            ? symbol.daysRemaining + " days"
                            : symbol.daysRemaining + " day"}
                        </p>
                        <Tooltip placement="top">
                          <TooltipTrigger
                            className={`${
                              !newAgeCheck(
                                symbol.completion,
                                symbol.name,
                                symbol.level,
                                symbol.daily,
                                symbol.weekly
                              ) && "hidden"
                            }`}
                          >
                            <MdOutlineInfo
                              size={20}
                              className={`fill-accent hover:fill-hover cursor-default transition-all mt-0.5`}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="tooltip z-10">
                            Around <span>November 15th</span>, an update will{" "}
                            <span>increase</span> <br></br> the daily symbol
                            count for {symbol.name}. <br></br> The completion
                            date will be <span>sooner</span> than it shows.{" "}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <p className="tablet:w-1/4 hidden tablet:block">
                      {symbol.level === (!swapped ? 20 : 11) ||
                      isNaN(symbol.level) ||
                      symbol.level === null
                        ? "‎"
                        : isNaN(symbol.symbolsRemaining) ||
                          symbol.symbolsRemaining === null ||
                          symbol.experience === null
                        ? "?"
                        : symbol.symbolsRemaining <= 0
                        ? "0"
                        : symbol.symbolsRemaining}
                    </p>
                  </div>
                  <div
                    className={`flex items-center flex-col tablet:flex-row px-4 tablet:px-0 text-center rounded-b-3xl bg-dark pt-2 pb-4 ${
                      (isNaN(symbol.level) || symbol.level === null) &&
                      "opacity-25 pointer-events-none"
                    } ${
                      symbol.level === (!swapped ? 20 : 11) &&
                      "pointer-events-none"
                    } ${
                      targetSymbol === index &&
                      selectedNone === false &&
                      symbol.level < (!swapped ? 20 : 11)
                        ? "block border-secondary"
                        : "hidden"
                    }`}
                  >
                    <div className="hidden tablet:block w-1/4">
                      <hr className="ml-[60px] laptop:ml-24 w-[190px] laptop:w-[330px] border-y border-white border-opacity-5 absolute"></hr>
                      <hr className="ml-[60px] laptop:ml-24 translate-y-level h-[40px] laptop:h-[40px] border-x border-white border-opacity-5 absolute"></hr>
                    </div>
                    <div className="tablet:w-1/4"></div>
                    <div className="flex tablet:block tablet:w-1/4 items-center justify-between tablet:justify-normal w-full tablet:space-x-0 mb-6 tablet:mb-0">
                      <p className="block tablet:hidden text-accent">
                        Target Level
                      </p>
                      <Tooltip placement="left">
                        <TooltipTrigger>
                          <input
                            type="number"
                            placeholder="Level"
                            value={
                              String(targetLevel) === "NaN" &&
                              levelSet === false &&
                              isMobile
                                ? setTargetLevel(!swapped ? 20 : 11)
                                : targetLevel
                            }
                            className="level-input"
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              if (
                                Number(e.target.value) <= (!swapped ? 20 : 11)
                              ) {
                                setTargetLevel(parseInt(e.target.value));
                                setLevelSet(true);
                              }
                              if (
                                Number(e.target.value) >= (!swapped ? 20 : 11)
                              ) {
                                setTargetLevel(!swapped ? 20 : 11);
                                setLevelSet(true);
                              }
                              if (Number(e.target.value) < 0) {
                                setTargetLevel(NaN);
                                setLevelSet(true);
                              }
                              if (e.target.value === "0") {
                                setTargetLevel(1);
                                setLevelSet(true);
                              }
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip z-10">
                          Preview the remaining{" "}
                          {isMobile ? "stats" : "days and"} <br></br>{" "}
                          {!isMobile && "symbols"} for the{" "}
                          <span>provided level</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <hr className="bg-gradient-to-r via-white border-0 opacity-20 h-px w-[250px] mb-6 block tablet:hidden"></hr>
                    <div className="tablet:w-1/4 flex justify-between w-full flex-col tablet:flex">
                      <div className="flex tablet:block justify-between tablet:justify-normal w-full items-center tablet:space-x-0 mb-5 tablet:mb-0">
                        <p className="block tablet:hidden">Completion Date</p>
                        <div>
                          <p className="text-tertiary tablet:text-secondary">
                            {targetSymbols === 0 &&
                            currentSymbol.experience !== null &&
                            currentSymbol.experience !== 0
                              ? "Complete"
                              : targetLevel <= symbol.level ||
                                isNaN(currentSymbol.experience) ||
                                currentSymbol.experience === null ||
                                isNaN(targetLevel) ||
                                (!currentSymbol.daily &&
                                  !currentSymbol.weekly) ||
                                targetDate === "Invalid Date"
                              ? "Indefinite"
                              : targetDays <= 0
                              ? "Complete"
                              : targetDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex tablet:block justify-between tablet:justify-normal w-full items-center tablet:space-x-0 mb-5 tablet:mb-0">
                        <p className="block tablet:hidden">Days Remaining</p>

                        <div className="flex tablet:space-x-1 justify-center items-center flex-row-reverse tablet:flex-row">
                          <p className=" text-tertiary ml-1 tablet:ml-0">
                            {targetSymbols === 0 &&
                            currentSymbol.experience !== null &&
                            currentSymbol.experience !== 0
                              ? "Ready for upgrade"
                              : targetLevel <= symbol.level
                              ? isTablet
                                ? "Level too low"
                                : "Level must be over " + symbol.level
                              : isNaN(targetLevel)
                              ? isTablet
                                ? "Enter a level"
                                : "Enter a target level"
                              : String(targetDays) ===
                                  ("Infinity" || "-Infiinity") ||
                                isNaN(targetDays) ||
                                (!currentSymbol.daily &&
                                  !currentSymbol.weekly) ||
                                isNaN(currentSymbol.experience) ||
                                currentSymbol.experience === null
                              ? "? days"
                              : targetDays > 1
                              ? targetDays + " days"
                              : targetDays <= 0
                              ? "Ready for upgrade"
                              : targetDays + " day"}
                          </p>
                          <Tooltip placement="top">
                            <TooltipTrigger
                              className={`${
                                !newAgeCheck(
                                  targetDate,
                                  symbol.name,
                                  symbol.level,
                                  symbol.daily,
                                  symbol.weekly
                                ) && "hidden"
                              }`}
                            >
                              <MdOutlineInfo
                                size={20}
                                className={`fill-accent hover:fill-hover cursor-default transition-all mt-0.5`}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="tooltip z-10">
                              Around <span>November 15th</span>, an update will{" "}
                              <span>increase</span> <br></br> the daily symbol
                              count for {symbol.name}. <br></br> The completion
                              date will be <span>sooner</span> than it shows.{" "}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="tablet:w-1/4 flex tablet:block justify-between tablet:justify-normal items-center w-full tablet:space-x-0">
                      <p className="block tablet:hidden">Symbols Remaining</p>
                      <p className="text-tertiary tablet:text-secondary">
                        {isNaN(targetSymbols) ||
                        targetSymbols < 0 ||
                        currentSymbol.experience === null ||
                        (currentSymbol.experience === 0 &&
                          (targetLevel <= currentSymbol.level ||
                            isNaN(targetLevel)))
                          ? targetSymbols <= 0
                            ? "0"
                            : "?"
                          : targetSymbols}
                      </p>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
};

export default Levels;
