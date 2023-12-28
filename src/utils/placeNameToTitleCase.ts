// Example: placeNameToTitleCase("MIDDLETON-ON-SEA")); // => "Middleton-On-Sea"
// Example: placeNameToTitleCase("BEXHILL & HASTINGS NO2")); // => "Bexhill & Hastings No2"

export default function placeNameToTitleCase(placeName: string): string {
  return placeName
    .toLowerCase() // "bexhill & hastings no2"
    .replace(/(^|-)\w|\b\w/g, (match) => match.toUpperCase()); // "Bexhill & Hastings No2"
}
