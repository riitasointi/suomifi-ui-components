import {
  cssObjectsToCss,
  FlattenSimpleInterpolation,
} from '../../../utils/css/utils';
import { typographyTokens, TypographyTokens } from '../typography';

export type TypographyTokensAsCss = {
  [key in keyof typeof typographyTokens]: string
};

type TypographyTokensAsCssProp = {
  [key in keyof TypographyTokens]: FlattenSimpleInterpolation
};
export interface TypographyUtil extends TypographyTokensAsCssProp {}
export class TypographyUtil {
  static instance: any;
  constructor(tokens: TypographyTokens) {
    // If instance not created, does not take on account if tokens is different!
    if (!TypographyUtil.instance) {
      // Assing typographyTokens as CSS FlattenSimpleInterpolation to this object
      Object.assign(this, cssObjectsToCss(tokens));
      TypographyUtil.instance = this;
    }
    return TypographyUtil.instance;
  }
}

/**
 * Add font-declarations to typography tokens
 * @param typography Typography-tokens
 * @return typographyWithUtils Typography-tokens and typography-tokens as CSS strings
 */
export const typographyUtils = (typography: TypographyTokens) => {
  const instance = new TypographyUtil(typography);
  Object.freeze(instance);
  return instance;
};
