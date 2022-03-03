import { TokenStandardEnum } from '../enum/token-standard.enum';

export const assetToSlug = ({ type, address=undefined, tokenId=undefined }) => {
  if (type === TokenStandardEnum.XTZ) {
    return "tez";
  }
  return type === TokenStandardEnum.FA2 ? `${address}_${tokenId}` : `${address}`;
};

export const slugToAsset = (slug) => {
  if (slug === "tez") {
    return { type: TokenStandardEnum.XTZ, address: undefined, tokenId: undefined };
  }
  const parts = slug.split("_");
  return {
    type: parts.length === 1 ? TokenStandardEnum.FA1_2 : TokenStandardEnum.FA2,
    address: parts[0],
    ...(parts.length === 1 ? {} : { tokenId: +parts[1] })
  };
};