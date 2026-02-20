import { useEffect, useRef } from 'react'

const AdSense = ({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = {},
  className = ''
}) => {
  const adRef = useRef(null)
  const isAdPushed = useRef(false)

  useEffect(() => {
    if (adRef.current && !isAdPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        isAdPushed.current = true
      } catch (e) {
        console.error('AdSense error:', e)
      }
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-1064721057524466"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}

export const AdBanner = ({ className = '' }) => (
  <AdSense
    adSlot="XXXXXXXXXX"
    adFormat="horizontal"
    className={`my-4 ${className}`}
    style={{ minHeight: '90px' }}
  />
)

export const AdInArticle = ({ className = '' }) => (
  <AdSense
    adSlot="XXXXXXXXXX"
    adFormat="fluid"
    className={`my-6 ${className}`}
    style={{ minHeight: '250px' }}
  />
)

export const AdSidebar = ({ className = '' }) => (
  <AdSense
    adSlot="XXXXXXXXXX"
    adFormat="vertical"
    className={`${className}`}
    style={{ minHeight: '600px' }}
  />
)

export const AdResponsive = ({ className = '' }) => (
  <AdSense
    adSlot="XXXXXXXXXX"
    adFormat="auto"
    fullWidthResponsive={true}
    className={`my-4 ${className}`}
    style={{ minHeight: '100px' }}
  />
)

export default AdSense
