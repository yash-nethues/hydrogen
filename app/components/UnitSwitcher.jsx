import { useEffect, useState } from 'react';

export default function UnitSwitcher({ onUnitChange, value }) {
  const normalized = (value || 'oz').toLowerCase();
  const [unit, setUnit] = useState(normalized === 'ml' ? 'ml' : 'oz');

  useEffect(() => {
    if (value && value.toLowerCase() !== unit) {
      setUnit(value.toLowerCase());
    }
  }, [value]);

  const toggleUnit = () => {
    const newUnit = unit === 'oz' ? 'ml' : 'oz';
    setUnit(newUnit);
    onUnitChange?.(newUnit);
  };

  return (
    <div className="flex items-center space-x-2 text-sm font-medium">
      <span className='text-[11px]'>OZ</span>
      <button
        onClick={toggleUnit}
        className='w-12 h-4 border border-grey-200 flex items-center rounded-full p-1 duration-300 ease-in-out'>
        <div
          className={`w-5 h-2.5 bg-green rounded-full shadow-md transform duration-300 ease-in-out ${
            unit === 'oz' ? 'translate-x-0' : 'translate-x-full'
          }`}
        />
      </button>
      <span className='text-[11px]'>ML</span>
    </div>
  );
}
