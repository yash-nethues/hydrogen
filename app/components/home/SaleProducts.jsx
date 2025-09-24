import React from 'react';

export default function SaleProducts({ ads }) {
  if (!ads || ads.length === 0) return null;
  const norm = (s) => (s || '').trim().toLowerCase();
  const nowTs = Date.now();
  const parseTs = (v) => {
    if (!v || typeof v !== 'string') return null;
    const ts = Date.parse(v);
    return Number.isFinite(ts) ? ts : null;
  };
  const withinWindow = (ad) => {
    const fromTs = parseTs(ad.from);
    const toTs = parseTs(ad.to);
    if (fromTs && nowTs < fromTs) return false;
    if (toTs && nowTs > toTs) return false;
    return true;
  };

  const topThree = ads.filter((ad) => norm(ad.position_) === 'top three ads block').filter(withinWindow);
  const twoBlock = ads.filter((ad) => norm(ad.position_) === 'two ads block').filter(withinWindow);

  const latestTopThree = topThree
    .slice()
    .sort((a, b) => (parseInt(b.ads_order) || 0) - (parseInt(a.ads_order) || 0))
    .slice(0, 3);

  const sortedTwoBlock = twoBlock.slice().sort((a, b) => (parseInt(a.ads_order) || 0) - (parseInt(b.ads_order) || 0));
  const twoRows = [];
  for (let i = 0; i < sortedTwoBlock.length; i += 2) {
    twoRows.push(sortedTwoBlock.slice(i, i + 2));
  }

  return (
    <div className='container mt-j30 md:px-10 2xl:px-[60px] -order-1 md:order-none'>
      {latestTopThree.length > 0 && (
        <div className='flex flex-col md:flex-row -mx-5 px-2.5 mb-10 md:mb-0 md:px-0 md:mx-0 gap-y-5 md:gap-x-5 lg:gap-x-10'>
          {latestTopThree.map((ad, idx) => (
            <div key={idx} className='w-full md:mb-[34px] md:w-4/12'>
              <a href={ad.ads_link || "#"}>
                <img src={ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="hidden md:block" />
                <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="md:hidden" />
              </a>
            </div>
          ))}
        </div>
      )}

      {twoRows.map((row, rIndex) => (
        <div key={rIndex} className='flex flex-col md:flex-row -mx-5 px-2.5 mb-10 md:mb-0 md:px-0 md:mx-0  gap-y-2.5 md:gap-x-5 lg:gap-x-10'>
          {row.map((ad, idx) => (
            <div key={idx} className='w-full md:mb-[34px] md:w-6/12'>
              <a href={ad.ads_link || "#"}>
                <img src={ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="hidden md:block" />
                <img src={ad.mobile_image || ad.ads_image || "/image/placeholder.jpg"} width="100%" height="auto" alt={ad.altText || `Ad ${idx + 1}`} className="md:hidden" />
              </a>
            </div>
          ))}
          {row.length === 1 && <div className='md:w-6/12'></div>}
        </div>
      ))}
    </div>
  );
}



