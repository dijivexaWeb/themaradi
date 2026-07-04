const STEPS = [
  { num: 1, label: 'Temel Bilgiler' },
  { num: 2, label: 'Fotoğraflar' },
  { num: 3, label: 'Hayat Hikayesi' },
  { num: 4, label: 'Video / Ses' },
  { num: 5, label: 'Yayın Onayı' },
]

export default function StepperNav({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step.num < currentStep
                    ? 'bg-[#174f35] text-white'
                    : step.num === currentStep
                    ? 'bg-[#174f35] text-white ring-4 ring-[#174f35]/15'
                    : 'bg-[#f0ebe0] text-[#a39a86]'
                }`}
              >
                {step.num < currentStep ? '✓' : step.num}
              </div>
              <span
                className={`hidden text-center text-[11px] font-medium sm:block ${
                  step.num <= currentStep ? 'text-[#174f35]' : 'text-[#a39a86]'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1.5 h-0.5 flex-1 rounded-full transition-colors ${
                  step.num < currentStep ? 'bg-[#174f35]' : 'bg-[#f0ebe0]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-[#788177] sm:hidden">
        Adım {currentStep} / {STEPS.length}: {STEPS[currentStep - 1]?.label}
      </p>
    </div>
  )
}
