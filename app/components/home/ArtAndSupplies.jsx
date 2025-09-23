import React from 'react';
import { RichTextRenderer } from '~/components/RichTextRenderer';

export default function ArtAndSupplies({ feature }) {
  if (!feature) return null;
  const bgStyle = feature.background_color ? { backgroundColor: feature.background_color } : {};
  return (
    <section className='mt-j30 md:mt-[50px] jlg::mt-[65px] -order-1 md:order-none' style={bgStyle}>
      <div className='container max-w-[1240px] md:px-10 2xl:px-[60px]'>
        <div className="specialist-in-providing center text-center -mx-5  py-5 px-2.5 md:mx-0 md:py-10 md:px-0">
          <div data-content-type="html" data-appearance="default" data-element="main" data-decoded="true">
            {feature.feature_title && (
              <h1 className='text-blue text-[clamp(11px,2.5vw,36px)] font-semibold mb-j5 block' dangerouslySetInnerHTML={{ __html: feature.feature_title }} />
            )}
            {feature.feature_content && (() => {
              try {
                const json = JSON.parse(feature.feature_content);
                if (json && typeof json === 'object') {
                  return (
                    <div className='text-blue text-[1.5vw] max-[479px]:text-[2.5vw] tb:text-[1.3em] block mb-j5 leading-normal'>
                      <RichTextRenderer content={json} />
                    </div>
                  );
                }
              } catch (_) {}
              return (
                <span className='text-blue text-[1.5vw] max-[479px]:text-[2.5vw] tb:text-[1.3em] block mb-j5 leading-normal' dangerouslySetInnerHTML={{ __html: feature.feature_content }} />
              );
            })()}
            {feature.feature_button && (
              <a href={feature.feature_button_link || '#'} className='text-blue underline text-[1.5vw] max-[479px]:text-[2.5vw] tb:text-sm'><strong>{feature.feature_button}</strong></a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}



