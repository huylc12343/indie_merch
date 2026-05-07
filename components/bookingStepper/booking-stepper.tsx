type BookingStepperProps = {
  currentStep: number;
  steps: string[];
};

export function BookingStepper({ currentStep, steps }: BookingStepperProps) {
  const safeStep = Math.min(Math.max(currentStep, 1), steps.length);
  const progressPercent =
    steps.length > 1 ? ((safeStep - 1) / (steps.length - 1)) * 100 : 0;
  const edgeOffsetPercent = steps.length > 0 ? 50 / steps.length : 0;

  return (
    <div className="w-full max-w-[560px]">
      <div className="relative flex items-start">
        <div
          className="absolute top-[30px] h-0.5 bg-[#6C6C6C]"
          style={{ left: `${edgeOffsetPercent}%`, right: `${edgeOffsetPercent}%` }}
        />
        <div
          className="absolute top-[30px] h-0.5 bg-[#FF017E] transition-all duration-300"
          style={{
            left: `${edgeOffsetPercent}%`,
            right: `${edgeOffsetPercent}%`,
            transformOrigin: "left",
            transform: `scaleX(${progressPercent / 100})`,
          }}
        />

        {steps.map((label, index) => {
          const step = index + 1;
          const isCurrent = step === safeStep;
          const isCompleted = step < safeStep;

          return (
            <div key={label} className="relative z-10 flex flex-1 flex-col items-center gap-3">
              <div
                className={[
                  "flex size-[60px] items-center justify-center rounded-full border-2 text-2xl font-semibold transition-colors duration-300",
                  isCurrent || isCompleted
                    ? "border-[#FF017E] bg-[#FF017E] text-white"
                    : "border-[#6C6C6C] bg-[#171717] text-[#6C6C6C]",
                ].join(" ")}
              >
                {step}
              </div>
              <p
                className={[
                  "text-center text-sm italic sm:text-base transition-colors duration-300",
                  isCurrent || isCompleted ? "text-white" : "text-[#6C6C6C]",
                ].join(" ")}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
