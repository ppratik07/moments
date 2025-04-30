interface DashboardProps {
  title: string;
  value: string;
  description: string;
  buttonText: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  buttonText,
}: DashboardProps) {
  return (
    <div className="bg-white w-72 h-72 p-6 rounded-lg shadow flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-center">{title}</h3>
        <p className="text-4xl text-center font-bold text-purple-600 mt-2">{value}</p>
        &nbsp;
        <hr/>
        <p className="text-sm text-gray-600 text-center mt-2">{description}</p>
      </div>
      <button className="px-4 py-2 border rounded text-blue-600 hover:bg-blue-50">
        {buttonText}
      </button>
    </div>
  );
}
