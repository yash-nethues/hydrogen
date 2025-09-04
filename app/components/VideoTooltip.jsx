import {useRef} from "react";

export default function VideoTooltip({src, label = "Show Video"}) {
  const tooltipRef = useRef(null);

  const handleToggle = () => {
    tooltipRef.current.classList.add("active");
  };
  const handleClose = () => {
    tooltipRef.current.classList.remove("active");
  };

  return (    
    <li ref={tooltipRef} className='group/video-item grow-0 w-1/2 relative ps-j30 pe-2.5 cursor-pointer'>
        <i className='w-5 h-4 absolute left-0 flex items-center justify-center top-1 bg-brand text-white'>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 640 640">
                <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" fill="currentColor" />
            </svg>
        </i>
        <span onClick={handleToggle}>Superior absorbency, performance  & resilience</span>
        <div className="pointer-events-none transition-all absolute left-0 z-10 bottom-0 opacity-0 invisible bg-base rounded-sm p-2 w-64 jlg:w-[590px] group-[.active]/video-item:bottom-full after:absolute after:top-full after:left-j30 after:-translate-y-1/2 after:w-2 after:h-2 after:bg-base after:rotate-45 group-[.active]/video-item:pointer-events-auto group-[.active]/video-item:opacity-100 group-[.active]/video-item:visible">
            <span  onClick={handleClose} className="absolute top-0 z-10 right-0 bg-brand flex items-center justify-center text-white w-j30 aspect-square rounded-bl-[20px] pb-1 ps-1">x</span>
            <video muted loop controls className='w-full align-top'>
                <source src={src} type="video/mp4" />
            </video>
        </div>
    </li>
  );
}
