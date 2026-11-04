export default function ClaimManualFallback({ businessName = '', website = '', category = '', serviceArea = '' }: { businessName?: string; website?: string; category?: string; serviceArea?: string }) {
  const subject = encodeURIComponent('Public Boat Ramps business claim');
  const body = encodeURIComponent(`Business name: ${businessName}\nWebsite: ${website}\nService category: ${category}\nCities or counties served: ${serviceArea}\n`);
  return <p>Online verification is not switched on yet. <a href={`mailto:contact@publicboatramps.com?subject=${subject}&body=${body}`}>Email the business details to contact@publicboatramps.com</a> and we will verify manually.</p>;
}
