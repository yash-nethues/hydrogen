import React, { useState } from 'react';

function Accordion({ page }) {
  const [openIndex, setOpenIndex] = useState(0); // Set the default state to open the first item

  const handleToggle = (index) => {
    // Toggle between opening and closing the clicked accordion item
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
     <section className='mt-10 p-10 bg-themegray'>
     <div className="faqs custom-container">
      <ul className="bg-white border border-gray-200">
        {Array(2)
          .fill()
          .map((_, index) => {
            return (
              <li key={index}>
                <div className="title relative pl-7 pt-5 pb-5 pb-10 border-b border-gray-200 text-blue text-xl font-500 justify-between flex">
                  <h2 className="mb-3">{page.title}</h2>
                  <button
                    className="btn right-4 absolute text-3xl"
                    onClick={() => handleToggle(index)} 
                  >
                    {openIndex === index ? '-' : '+'}
                  </button>
                </div>
                {openIndex === index && (
                  <div
                    className="p-7 pb-14 text-base a:text-blue text-base [&>p>a]:underline [&>p>a]:font-bold [&>p>a]:text-blue hover:[&>p>a]:text-brand [&>p]:pb-4"
                    dangerouslySetInnerHTML={{ __html: page.body }}
                  />
                )}
              </li>
            );
          })}
      </ul>
      </div>
      </section>
    </>
  );
}

export default Accordion;
