import { useEffect } from 'react'

const SEOHead = ({
  title = 'Meridian EMS - AI-Powered Education Management System',
  description = 'Transform your institution with Meridian EMS - the complete AI-powered Education Management System.',
  keywords = '',
  canonicalUrl = '',
  ogImage = 'https://meridiancms.tech/og-image.png',
  ogType = 'website',
  noIndex = false
}) => {
  useEffect(() => {
    document.title = title

    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)
      if (meta) {
        meta.setAttribute('content', content)
      } else {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        meta.setAttribute('content', content)
        document.head.appendChild(meta)
      }
    }

    const updateLinkTag = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`)
      if (link) {
        link.setAttribute('href', href)
      } else {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        link.setAttribute('href', href)
        document.head.appendChild(link)
      }
    }

    updateMetaTag('description', description)
    if (keywords) updateMetaTag('keywords', keywords)
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', ogImage, true)
    updateMetaTag('og:type', ogType, true)
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true)
      updateLinkTag('canonical', canonicalUrl)
    }

    updateMetaTag('twitter:title', title, true)
    updateMetaTag('twitter:description', description, true)
    updateMetaTag('twitter:image', ogImage, true)

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex])

  return null
}

export default SEOHead
