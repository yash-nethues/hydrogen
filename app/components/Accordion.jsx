import React, { useState } from 'react';

function Accordion({ page, faqs }) {
  const [openIndex, setOpenIndex] = useState(0); // Default: Open first item

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <section className="mt-10 py-10 bg-grey-100" id="faq">
      <div className="faqs custom-container">
        <ul className="bg-white border border-gray-200">
          {/*<li className='border-t border-gray-200 first:border-t-0'>
            <div
              onClick={() => handleToggle(0)} role="button"
              className="cursor-pointer title relative p-5 md:p-0 text-blue font-medium flex justify-between"
            >
              <h2 className="py-5 pl-j30 flex-1 pr-10  mb-2.5 text-xl/normal">{page.title}</h2>
              <button className="btn right-4 font-medium md:top-4 absolute text-3xl">
                {openIndex === 0 ? '-' : '+'}
              </button>
            </div>
            {openIndex === 0 && (
              <div
                className=" p-5 md:p-j30 md:pt-0 [&_p]:mb-2.5 [&_a]:text-blue [&_a]:font-bold [&_a]:mx-1 [&_a]:underline [&_a]:underline-offset-1"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            )}
          </li>*/}

        
          {faqs?.map(({ node }, index) => {
            const title = node.fields.find((field) => field.key === "faq_title")?.value;
            const content = node.fields.find((field) => field.key === "faq_content")?.value;
            const parsedContent = JSON.parse(content);

            return (
              <li key={node.id}  className='border-t border-gray-200 first:border-t-0'>
                <div
                  onClick={() => handleToggle(index + 1)} role="button"
                  className="cursor-pointer title relative p-5 md:p-0 text-blue font-medium flex justify-between"
                >
                  <h2 className="py-5 pl-j30 flex-1 pr-10 mb-2.5 text-xl/normal">{title}</h2>
                  <button className="btn right-4 font-medium md:top-4 absolute text-3xl">
                    {openIndex === index + 1 ? '-' : '+'}
                  </button>
                </div>
                {openIndex === index + 1 && (
                  <div className=" p-5 md:p-j30 md:pt-0 text-base [&_p]:mb-2.5 [&_a]:text-blue [&_a]:font-bold [&_a]:mx-1 [&_a]:underline [&_a]:underline-offset-1">
                    {parsedContent.children.map((child, i) => (
                      <p key={i}>{child.children[0].value}</p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Accordion;