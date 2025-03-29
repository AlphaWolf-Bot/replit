import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';

/**
 * AdBanner component that displays advertisements
 * @param {string} placement - The placement zone for the ad ('header', 'footer', 'sidebar', 'main', 'earn', etc.)
 * @param {boolean} fullWidth - Whether the ad should take full width
 * @param {string} className - Additional CSS classes
 */
const AdBanner = ({ placement = 'main', fullWidth = false, className = '' }) => {
  const scriptRef = useRef(null);

  const { data: ad, isLoading } = useQuery({
    queryKey: ['/api/ads', { placement }],
    enabled: !!placement
  });

  // Execute script content if ad is script type
  useEffect(() => {
    if (ad?.data?.type === 'script' && ad?.data?.scriptContent && scriptRef.current) {
      try {
        // Clear previous script content
        while (scriptRef.current.firstChild) {
          scriptRef.current.removeChild(scriptRef.current.firstChild);
        }
        
        // Create and execute new script
        const script = document.createElement('script');
        script.text = ad.data.scriptContent;
        scriptRef.current.appendChild(script);
      } catch (error) {
        console.error('Error executing ad script:', error);
      }
    }
  }, [ad]);

  if (isLoading || !ad?.data) {
    return null;
  }

  const adData = ad.data;

  // If ad is not active, don't show anything
  if (!adData.isActive) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${fullWidth ? 'w-full' : 'max-w-sm'} ${className}`}>
      <CardContent className="p-0">
        {adData.type === 'image' && (
          <a 
            href={adData.linkUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <img 
              src={adData.imageUrl} 
              alt={adData.altText || adData.name} 
              className="w-full object-cover"
            />
          </a>
        )}
        
        {adData.type === 'html' && (
          <div 
            dangerouslySetInnerHTML={{ __html: adData.htmlContent || '' }}
            className="w-full h-full"
          />
        )}
        
        {adData.type === 'script' && (
          <div ref={scriptRef} className="w-full h-full min-h-[100px]" />
        )}
      </CardContent>
    </Card>
  );
};

export default AdBanner;