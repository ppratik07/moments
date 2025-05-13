interface DashboardProps {
  title: string;
  value: string;
  description: string;
  buttonText?: string;
  className?: string;
  titleClassName? : string
  onButtonClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  description,
  buttonText,
  className = "",
  titleClassName = "",
  onButtonClick,
}: DashboardProps) {
  return (
    <div
      className={`bg-white w-80 h-96 p-6 rounded-lg shadow flex flex-col justify-between border border-transparent hover:border-pink-500 transition duration-300 ${className}`}
    >
      <div>
        <h3 className={`text-lg font-semibold text-center ${titleClassName}`}>{title}</h3>
        <p className="text-4xl text-center font-bold text-purple-600 mt-2">{value}</p>
        &nbsp;
        <hr />
        <p className="text-sm text-gray-600 text-center mt-2">{description}</p>
      </div>
      <button
        className="px-4 py-2 border rounded text-blue-600 hover:bg-blue-50"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

