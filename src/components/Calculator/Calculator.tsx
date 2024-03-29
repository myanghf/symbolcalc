import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { TbSlash } from "react-icons/tb";
import { MdOutlineInfo } from "react-icons/md";
import "./Calculator.css";
import dayjs from "dayjs";
import { FiUnlock, FiLock, FiCheck } from "react-icons/fi";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip/Tooltip";

interface Props {
  symbols: [
    {
      id: number;
      name: string;
      alt: string;
      img: string;
      type: string;
      dailyName: string;
      weeklyName: string;
      extraName: string;
      level: number;
      experience: number;
      daily: boolean;
      weekly: boolean;
      extra: boolean;
      dailySymbols: number;
      daysRemaining: number;
      totalDaysRemaining: number;
      symbolsRemaining: number;
      mondayCount: number;
      completion: string;
      locked: boolean;
      symbolsRequired: Array<number>;
      mesosRequired: Array<number>;
    }
  ];
  setSymbols: Dispatch<SetStateAction<object>>;
  selectedSymbol: number;
  swapped: boolean;
}

const Calculator = ({
  symbols,
  setSymbols,
  selectedSymbol,
  swapped,
}: Props) => {
  /* ―――――――――――――――――――― Declarations ――――――――――――――――――― */

  const currentSymbol = symbols[selectedSymbol];
  const [symbolsToNext, setSymbolsToNext] = useState(NaN);

  const [overflowLevel, setOverflowLevel] = useState(NaN);
  const [overflowExperience, setOverflowExperience] = useState(NaN);

  const nextExperience = currentSymbol?.symbolsRequired[currentSymbol.level];

  /* | ―――――――――――――――――――― Calculations ――――――――――――――――――― */

  // Calculate Daily/Weekly Symbols
  const dailySymbols = currentSymbol.daily
    ? currentSymbol.dailySymbols *
      (currentSymbol.extra ? (currentSymbol.type === "arcane" ? 2 : 1.5) : 1)
    : 0;

  /*
   | Calculate Total Symbols Remaining
   ――――――――――――――――――――――――――――――――
  */

  const remainingSymbols =
    currentSymbol.symbolsRequired
      .slice(currentSymbol.level, !swapped ? 20 : 11)
      .reduce((accumulator, experience) => accumulator + experience, 0) -
    currentSymbol.experience;

  useEffect(() => {
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, symbolsRemaining: remainingSymbols }
          : symbol
      )
    );
  }, [currentSymbol.completion, currentSymbol.level, currentSymbol.experience]);

  /*
   | Calculate Remaining Days
   ―――――――――――――――――――――――――――
   */

  useMemo(() => {
    try {
      let days = 0;
      let count = 0;
      let resets = 0;
      let mondayReached = false;
      for (let i = 0; i < 1000; i++) {
        if (
          days * dailySymbols + (currentSymbol.weekly ? resets * 45 : 0) <
          nextExperience - currentSymbol.experience
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

      setSymbolsToNext(days);

      let days2 = 0;
      let count2 = 0; //TODO: TONS OF HALF ASS DUPLICTED GARABGE CODE PLEASE FIX.
      let resets2 = 0;
      let mondayReached2 = false;
      for (let i = 0; i < 1000; i++) {
        if (
          days2 * dailySymbols + (currentSymbol.weekly ? resets2 * 45 : 0) <
          remainingSymbols
        ) {
          if (
            // ? Should this be a while loop? while monday false
            mondayReached2 === false &&
            dayjs().add(count2, "day").isBefore(dayjs().day(8))
          ) {
            count2++;
            if (dayjs().add(count2, "day").isSame(dayjs().day(8))) {
              //resets++; // ? Should the 'Weekly Done' toggle be included?
              mondayReached2 = true;
            }
          } else if ((days2 - count2) % 7 === 0) {
            resets2++;
          }
          days2++;
        }
      }

      setSymbols(
        symbols.map((symbol) =>
          symbol.id === selectedSymbol + 1
            ? { ...symbol, daysRemaining: days2 }
            : symbol
        )
      );
    } catch (e) {
      //console.log(e as Error);
    }
  }, [
    currentSymbol.completion,
    currentSymbol.daily,
    currentSymbol.extra,
    currentSymbol.weekly,
    currentSymbol.name,
    currentSymbol.level,
    currentSymbol.experience,
  ]);

  // Calculate Completion Date
  const completion = dayjs()
    .add(currentSymbol.daysRemaining, "day")
    .format("YYYY-MM-DD")
    .toString();

  useMemo(() => {
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === selectedSymbol + 1
          ? { ...symbol, completion: completion }
          : symbol
      )
    );
  }, [currentSymbol.daysRemaining]);

  const symbolData = JSON.parse(localStorage.getItem("symbolData") || "[]");

  useEffect(() => {
    localStorage.setItem("symbolData", JSON.stringify(symbols));
  }, [
    currentSymbol.level,
    currentSymbol.experience,
    currentSymbol.daily,
    currentSymbol.weekly,
    currentSymbol.extra,
    currentSymbol.daysRemaining,
    currentSymbol.symbolsRemaining,
    currentSymbol.completion,
    currentSymbol.locked,
  ]);

  // Load data only if data exists.
  useEffect(() => {
    try {
      for (let i = 0; i < symbols.length; i++) {
        if (symbolData[i].level !== null || symbolData[i].experience !== null)
          setSymbols(symbolData);
      }
    } catch (e) {
      console.log("Data Not Detected");
    }
  }, []);

  useEffect(() => {
    setOverflowLevel(currentSymbol.level);
    let totalLevels = 0;
    let totalExp = 0;
    currentSymbol.symbolsRequired.forEach((symbol, indexLevel) => {
      if (
        indexLevel >= currentSymbol.level &&
        currentSymbol.experience >=
          currentSymbol.symbolsRequired[indexLevel] + totalExp
      ) {
        totalLevels++;
        totalExp += currentSymbol.symbolsRequired[indexLevel];
        setOverflowLevel(currentSymbol.level + totalLevels);
      }
      setOverflowExperience(currentSymbol.experience - totalExp);
    });
  }, [currentSymbol.level, currentSymbol.experience]);

  useMemo(() => {
    try {
      if (currentSymbol.experience >= nextExperience && currentSymbol.locked) {
        setSymbols(
          symbols.map((symbol) =>
            symbol.id === selectedSymbol + 1
              ? { ...symbol, experience: nextExperience }
              : symbol
          )
        );
      }
    } catch (e) {
      ////console.log((e as Error).message);
    }
  }, [currentSymbol.locked]);

  useEffect(() => {
    if (
      currentSymbol.experience === 0 &&
      currentSymbol.level === (!swapped ? 20 : 11)
    ) {
      setSymbols(
        symbols.map((symbol) =>
          symbol.id === selectedSymbol + 1
            ? { ...symbol, locked: true }
            : symbol
        )
      );
    }
  }, [currentSymbol.experience]);

  /* ―――――――――――――――――――― Render Logic ――――――――――――――――――― */

  return (
    <section className="calculator">
      <div className="flex pt-16 bg-gradient-to-t from-card-tool to-card-grad justify-between tablet:justify-normal rounded-t-lg flex-col tablet:flex-row w-[350px] space-y-8 tablet:space-y-0 tablet:w-[700px] h-[700px] tablet:h-[350px]">
        <div className="px-10 space-y-6 w-[350px]">
          <div className="flex justify-center items-center space-x-4 pb-6">
            <img src={currentSymbol.img} alt={currentSymbol.alt} width={33} />
            <p className="text-xl text-primary font-semibold tracking-wider uppercase">
              {currentSymbol.name}
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <div className="flex justify-center items-center space-x-2">
                <input
                  type="number"
                  placeholder="Level"
                  value={
                    currentSymbol.level === null ? "NaN" : currentSymbol.level
                  }
                  className="symbol-input"
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    if (Number(e.target.value) <= (!swapped ? 20 : 11)) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? { ...symbol, level: parseInt(e.target.value) }
                            : symbol
                        )
                      );
                    }
                    if (Number(e.target.value) >= (!swapped ? 20 : 11)) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? {
                                ...symbol,
                                level: !swapped ? 20 : 11,
                                experience: 0,
                              }
                            : symbol
                        )
                      );
                    }
                    if (Number(e.target.value) < 0) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? { ...symbol, level: NaN }
                            : symbol
                        )
                      );
                    }
                    if (e.target.value === "0") {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? { ...symbol, level: 1 }
                            : symbol
                        )
                      );
                    }
                  }}
                ></input>
                <TbSlash size={30} color="#B2B2B2" />
                <div className="absolute translate-x-[111px]">
                  <div
                    className={`w-[40px] h-[40px] pl-2 ${
                      (currentSymbol.experience < nextExperience ||
                        isNaN(currentSymbol.experience) ||
                        currentSymbol.experience === 0 ||
                        !currentSymbol.level) &&
                      currentSymbol.locked &&
                      "hidden"
                    }`}
                  >
                    <Tooltip placement="bottom">
                      <TooltipTrigger className="translate-y-[11px]">
                        <FiUnlock
                          size={18}
                          color="#718571"
                          onClick={() => {
                            setSymbols(
                              symbols.map((symbol) =>
                                symbol.id === selectedSymbol + 1
                                  ? { ...symbol, locked: !currentSymbol.locked }
                                  : symbol
                              )
                            );
                          }}
                          className={`cursor-pointer ${
                            (!currentSymbol.locked ||
                              currentSymbol.experience < nextExperience ||
                              isNaN(currentSymbol.experience) ||
                              currentSymbol.experience === 0) &&
                            "hidden"
                          }`}
                        />
                        <FiLock
                          size={18}
                          color="#857871"
                          onClick={() => {
                            setSymbols(
                              symbols.map((symbol) =>
                                symbol.id === selectedSymbol + 1
                                  ? { ...symbol, locked: !currentSymbol.locked }
                                  : symbol
                              )
                            );
                          }}
                          className={`cursor-pointer ${
                            currentSymbol.locked && "hidden"
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="tooltip">
                        <span>{currentSymbol.locked ? "Unlock" : "Lock"}</span>{" "}
                        experience cap
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div
                    className={`absolute translate-x-[46px] ${
                      currentSymbol.experience <= nextExperience &&
                      "pointer-events-none"
                    }`}
                  >
                    <FiCheck
                      size={20}
                      color={
                        currentSymbol.experience > nextExperience
                          ? "#718571"
                          : "#857871"
                      }
                      onClick={() =>
                        setSymbols(
                          symbols.map((symbol) =>
                            symbol.id === selectedSymbol + 1
                              ? {
                                  ...symbol,
                                  level: overflowLevel,
                                  experience:
                                    currentSymbol.experience <
                                    currentSymbol.symbolsRemaining +
                                      currentSymbol.experience
                                      ? overflowExperience
                                      : 0,
                                  locked: true,
                                }
                              : symbol
                          )
                        )
                      }
                      className={`cursor-pointer translate-y-[-29.5px] ${
                        currentSymbol.locked && "hidden"
                      }`}
                    />
                  </div>
                </div>
                <input
                  type="number"
                  placeholder={currentSymbol.locked ? "Experience" : "Exp"}
                  value={
                    currentSymbol.experience === null
                      ? "NaN"
                      : currentSymbol.experience
                  }
                  className="symbol-input"
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    if (
                      isNaN(currentSymbol.level) ||
                      currentSymbol.level === null
                    ) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? { ...symbol, experience: NaN }
                            : symbol
                        )
                      );
                    }
                    if (
                      Number(e.target.value) <=
                      (currentSymbol.locked
                        ? nextExperience
                        : !swapped
                        ? 2679
                        : 4565)
                    ) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? {
                                ...symbol,
                                experience: parseInt(e.target.value),
                              }
                            : symbol
                        )
                      );
                    }
                    if (
                      Number(e.target.value) >=
                      (currentSymbol.locked
                        ? nextExperience
                        : !swapped
                        ? 2679
                        : 4565)
                    ) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? {
                                ...symbol,
                                experience: currentSymbol.locked
                                  ? nextExperience
                                  : !swapped
                                  ? 2679
                                  : 4565,
                              }
                            : symbol
                        )
                      );
                    }
                    if (e.target.value === "0" && currentSymbol.level === 1) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? { ...symbol, experience: 1 }
                            : symbol
                        )
                      );
                    }
                    if (e.target.value === "00" || e.target.value === "000") {
                      currentSymbol.level === 1
                        ? setSymbols(
                            symbols.map((symbol) =>
                              symbol.id === selectedSymbol + 1
                                ? { ...symbol, experience: 1 }
                                : symbol
                            )
                          )
                        : (e.target.value = "0");
                    }
                    if (Number(e.target.value) < 0) {
                      setSymbols(
                        symbols.map((symbol) =>
                          symbol.id === selectedSymbol + 1
                            ? { ...symbol, experience: NaN }
                            : symbol
                        )
                      );
                    }
                    if (e.target.value.startsWith("0")) {
                      e.target.value = e.target.value.substring(1);
                    }
                  }}
                ></input>
              </div>
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <span>Symbol</span> Level / Exp
            </TooltipContent>
          </Tooltip>

          <div className="flex space-x-2">
            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={`daily-box ${
                    currentSymbol.daily && "border-checked"
                  }`}
                  onClick={() =>
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? {
                              ...symbol,
                              daily: !currentSymbol.daily,
                            }
                          : symbol
                      )
                    )
                  }
                >
                  Daily
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Daily Quest]</span>
                <br></br> {currentSymbol.dailyName}
              </TooltipContent>
            </Tooltip>

            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={`daily-box ${
                    currentSymbol.weekly && "border-checked"
                  } ${currentSymbol.type === "arcane" ? "block" : "hidden"}`}
                  onClick={() =>
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? {
                              ...symbol,
                              weekly: !currentSymbol.weekly,
                            }
                          : symbol
                      )
                    )
                  }
                >
                  Weekly
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Weekly Quest]</span>
                <br></br> {currentSymbol.weeklyName}
              </TooltipContent>
            </Tooltip>

            <Tooltip placement="bottom">
              <TooltipTrigger asChild={true}>
                <button
                  className={`daily-box ${
                    currentSymbol.extra && "border-checked"
                  } ${
                    typeof currentSymbol.extra !== "undefined"
                      ? "block"
                      : "hidden"
                  }
                }`}
                  onClick={() =>
                    setSymbols(
                      symbols.map((symbol) =>
                        symbol.id === selectedSymbol + 1
                          ? {
                              ...symbol,
                              extra: !currentSymbol.extra,
                            }
                          : symbol
                      )
                    )
                  }
                >
                  Extra
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Unlocked]</span>
                <br></br> {currentSymbol.extraName}
              </TooltipContent>
            </Tooltip>
          </div>

          <div
            className={`flex flex-row text-center text-sm  pt-6 text-tertiary ${
              currentSymbol.type === "arcane"
                ? "justify-between"
                : "justify-center"
            }`}
          >
            <p className="text-sm">
              {currentSymbol.daily && currentSymbol.extra
                ? currentSymbol.name != "Cernium"
                  ? currentSymbol.dailySymbols * 2
                  : currentSymbol.dailySymbols + 5
                : currentSymbol.daily
                ? currentSymbol.dailySymbols
                : 0}{" "}
              symbols / day
            </p>
            <p className="text-sm">
              {currentSymbol.type === "arcane"
                ? currentSymbol.weekly
                  ? 45 + " symbols / week"
                  : 0 + " symbols / week"
                : ""}{" "}
            </p>
          </div>
        </div>

        <div className="vertical-divider"></div>

        <div className="w-[350px] space-y-10">
          <div className="text-secondary text-center space-y-1.5">
            <div className="flex justify-center items-center text-primary text-xl font-semibold tracking-wider">
              <div
                className={`text-secondary text-center space-y-1.5 pt-0.5 ${
                  isNaN(currentSymbol.level) ||
                  currentSymbol.level === null ||
                  currentSymbol.level === (!swapped ? 20 : 11)
                    ? "hidden"
                    : "block"
                }`}
              >
                {(() => {
                  try {
                    //TODO: BANDAID FIX. HORRIBLE LOGIC UPDATE ASAP
                    if (
                      currentSymbol.type === (!swapped ? "arcane" : "sacred") ||
                      (currentSymbol.level != (!swapped ? 20 : 11) &&
                        currentSymbol.level != (!swapped && 11) &&
                        String(currentSymbol.level) != "NaN")
                    ) {
                      return (
                        <div className="flex space-x-3 items-center justify-center text-primary font-semibold tracking-wider">
                          <h1 className="text-xl">
                            Level{" "}
                            <span className="text-xl">
                              {currentSymbol.level}
                            </span>
                          </h1>
                          <FaArrowRight size={20} className="fill-basic" />
                          <h1 className="text-xl">
                            Level{" "}
                            <span className="text-xl">
                              {currentSymbol.level + 1}
                            </span>
                          </h1>
                        </div>
                      );
                    }
                  } catch (e) {
                    //console.log((e as Error).message);
                  }
                })()}
              </div>
              <div>
                {(() => {
                  try {
                    if (
                      currentSymbol.level === (!swapped ? 20 : 11) &&
                      currentSymbol.type === (!swapped ? "arcane" : "sacred")
                    ) {
                      //TODO: BANDAID FIX. HORRIBLE LOGIC UPDATE ASAP
                      return (
                        <div className="py-[72.5%]">
                          <p className="text-accent text-2xl tracking-widest uppercase">
                            Max Level
                          </p>
                        </div>
                      );
                    } else if (
                      isNaN(currentSymbol.level) ||
                      currentSymbol.level === null
                    ) {
                      return (
                        <div className="space-y-4 py-[40%]">
                          <p className="text-secondary text-2xl tracking-widest uppercase">
                            Disabled
                          </p>
                          <p className="text-secondary text-xs lowercase font-light tracking-widest">
                            Enter a level to enable this symbol
                          </p>
                        </div>
                      );
                    }
                  } catch (e) {
                    //console.log((e as Error).message);
                  }
                })()}
              </div>
            </div>
          </div>

          <div
            className={`text-secondary text-center space-y-1.5 ${
              isNaN(currentSymbol.level) ||
              currentSymbol.level === null ||
              currentSymbol.level === (!swapped ? 20 : 11)
                ? "hidden"
                : "block"
            }`}
          >
            {(() => {
              try {
                if (
                  currentSymbol.experience < nextExperience &&
                  (currentSymbol.daily || currentSymbol.weekly) &&
                  currentSymbol.experience !== null
                ) {
                  return (
                    <div className="flex justify-center space-x-1.5">
                      <p>
                        <span>{symbolsToNext > 0 ? symbolsToNext : 0}</span>{" "}
                        {symbolsToNext > 1 ? "days to go" : "day to go"}
                      </p>
                      <Tooltip placement={"top"}>
                        <TooltipTrigger asChild={true}>
                          {" "}
                          <MdOutlineInfo
                            size={20}
                            className="fill-accent hover:fill-hover cursor-default transition-all mt-0.5"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="tooltip">
                          The completion date assumes that <br></br> you have{" "}
                          <span>completed</span> both your <br></br>{" "}
                          <span>daily</span> and <span>weekly</span> quests
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                } else if (nextExperience - currentSymbol.experience <= 0) {
                  return (
                    <p>
                      <span>Ready</span> for upgrade
                    </p>
                  );
                } else if (
                  isNaN(currentSymbol.experience) ||
                  currentSymbol.experience === null
                ) {
                  return (
                    <p>
                      <span>Experience</span> is not set
                    </p>
                  );
                } else {
                  return (
                    <p>
                      <span>Quests</span> are not set
                    </p>
                  );
                }
              } catch (e) {
                //console.log((e as Error).message);
              }
            })()}
            {(() => {
              try {
                if (
                  currentSymbol.experience < nextExperience &&
                  currentSymbol.experience !== null
                ) {
                  return (
                    <p>
                      <span>{nextExperience - currentSymbol.experience}</span>{" "}
                      {nextExperience - currentSymbol.experience > 1
                        ? "symbols remaining"
                        : "symbol remaining"}
                    </p>
                  );
                } else if (nextExperience - currentSymbol.experience <= 0) {
                  return (
                    <p>
                      <span>Sufficient</span> symbols reached
                    </p>
                  );
                } else {
                  return (
                    <p>
                      <span>Unknown</span> symbols remaining
                    </p>
                  );
                }
              } catch (e) {
                //console.log((e as Error).message);
              }
            })()}
            {(() => {
              try {
                if (
                  currentSymbol.level <= (!swapped ? 19 : 10) &&
                  currentSymbol.level > 0
                ) {
                  return (
                    <p className="pt-8">
                      <span>
                        {currentSymbol.mesosRequired[
                          currentSymbol.level
                        ].toLocaleString()}
                      </span>{" "}
                      mesos required
                      <div className="flex justify-center items-center space-x-1.5 pt-[41px]">
                        <p>
                          <span>{!swapped ? "+100" : "+200"}</span> main stat
                        </p>
                        <Tooltip placement={"right"}>
                          <TooltipTrigger asChild={true}>
                            {" "}
                            <MdOutlineInfo
                              size={20}
                              className="fill-accent hover:fill-hover cursor-default transition-all mt-0.5"
                            />
                          </TooltipTrigger>
                          <TooltipContent className="tooltip">
                            <span>{!swapped ? "+2,100" : "4,200"} </span> HP
                            (Demon Avenger)<br></br>
                            <span>{!swapped ? "+48" : "96"}</span> All Stat
                            (Xenon)
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </p>
                  );
                }
              } catch (e) {
                //console.log((e as Error).message);
              }
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
