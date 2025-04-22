export const StepIndicator = ({ currentStep = 1 }) => {
    const steps = ['Contribute', 'Your Information', 'Done'];
  
    return (
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 font-medium mb-10 mt-10">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          //const isCompleted = index + 1 < currentStep;
  
          return (
            <div key={step} className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'border border-purple-300 text-purple-300'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={isActive ? 'text-black' : 'text-purple-300'}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && <span className="text-purple-200">»</span>}
            </div>
          );
        })}
      </div>
    );
  };
  
  export default StepIndicator;
  