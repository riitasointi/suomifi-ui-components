import React, { HTMLProps } from 'react';
import { default as styled, css } from 'styled-components';
import { resets, resetWithSelectors } from '../utils';
import { asPropType } from '../../utils/typescript';

export interface HtmlTextareaProps
  extends Omit<HTMLProps<HTMLTextAreaElement>, 'ref' | 'as'> {
  as?: asPropType;
  /** Ref object passed to the element */
  forwardedRef?: React.RefObject<HTMLTextAreaElement>;
}

const textareaResets = css`
  ${resets.normalize.html}
  ${resets.normalize.textarea}
  ${resetWithSelectors(['::-webkit-input-placeholder'])}
  ${resets.common}
  display: inline-block;
  max-width: 100%;
`;

const Textarea = ({ forwardedRef, ...passProps }: HtmlTextareaProps) => (
  <textarea {...passProps} ref={forwardedRef} />
);

export const HtmlTextarea = styled(Textarea)`
  ${textareaResets}
`;
