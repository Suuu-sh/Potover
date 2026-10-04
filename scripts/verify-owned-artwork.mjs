import {validateOwnedArtwork} from './owned-artwork.mjs';
const result=await validateOwnedArtwork({exportDirectory:process.argv.includes('--export')?'out':undefined});
console.log(`Verified ${result.artworks} Potover topic illustrations (${result.bytes} bytes); no third-party preview assets.`);
