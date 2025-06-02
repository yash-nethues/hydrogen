import React, { useState } from 'react';

function Accordion({ page, faqs }) {
  const [openIndex, setOpenIndex] = useState(0); // Default: Open first item

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <section className="mt-10 xl:pt-10 xl:pb-10 bg-grey-100" id="faq">
      <div className="faqs container 2xl:container">
        <ul className="bg-white border border-gray-200">
          <li>
            <div
              onClick={() => handleToggle(0)}
              className="cursor-pointer title relative pl-7 pr-7 pt-5 pb-5 border-t border-gray-200 text-blue text-xl font-[500] flex justify-between"
            >
              <h2 className="mb-3">{page.title}</h2>
              <button className="btn right-4 font-[500] absolute text-3xl">
                {openIndex === 0 ? '-' : '+'}
              </button>
            </div>
            {openIndex === 0 && (
              <div
                className="border-t border-gray-200 p-7 pb-14 text-base [&>p]:pb-4"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            )}
          </li>

        
          {faqs?.map(({ node }, index) => {
            const title = node.fields.find((field) => field.key === "faq_title")?.value;
            const content = node.fields.find((field) => field.key === "faq_content")?.value;
            const parsedContent = JSON.parse(content);

            return (
              <li key={node.id}>
                <div
                  onClick={() => handleToggle(index + 1)}
                  className="cursor-pointer title relative pl-7 pr-7 pt-5 pb-5 border-t border-gray-200 text-blue text-xl font-[500] flex justify-between"
                >
                  <h2 className="mb-3">{title}</h2>
                  <button className="btn right-4 font-[500] absolute text-3xl">
                    {openIndex === index + 1 ? '-' : '+'}
                  </button>
                </div>
                {openIndex === index + 1 && (
                  <div className="border-t border-gray-200 p-7 pb-14 text-base [&>p]:pb-4">
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