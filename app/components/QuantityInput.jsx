import {useState} from 'react';

export default function QuantityInput({quantity = 1, onChange, sectionClasses = '', btnClasses = '', fieldClasses = '' }) {
  const [qty, setQty] = useState(quantity);

  const updateQty = (newQty) => {
    const validQty = Math.max(1, newQty); // prevent qty < 1
    setQty(validQty);
    if (onChange) onChange(validQty);
  };

  return (
    <div className={`flex flex-auto ${sectionClasses}`}>
      <button
        type="button"
        onClick={() => updateQty(qty - 1)}
        className={`flex-none border-0 rounded-none transition-all ${btnClasses}`}>
        −
      </button>
      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => updateQty(Number(e.target.value))}
        className={`flex-auto w-full inputNumArrowHidden text-center ${fieldClasses}`} />
      <button
        type="button"
        onClick={() => updateQty(qty + 1)}
        className={`flex-none border-0 rounded-none transition-all ${btnClasses}`}>
        +
      </button>
    </div>
  );
}
