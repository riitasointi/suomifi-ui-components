import { css } from 'styled-components';
import { TextareaProps } from './Textarea';
import { withSuomifiTheme, TokensAndTheme } from '../../theme';
import { disabledCursor } from '../../../components/utils/css';
import { element, font } from '../../theme/reset';
import { focus } from '../../theme/utils/focus';
import { Omit } from '../../../utils/typescript';

export const baseStyles = withSuomifiTheme(
  ({ theme, resize }: TokensAndTheme & Omit<TextareaProps, 'labelText'>) => css`
    ${element({ theme })}
    ${font({ theme })('bodyText')}

    &.fi-textarea {
      display: flex;
      flex-direction: column;
      color: ${theme.colors.blackBase};

      & .fi-textarea_label {
        ${font({ theme })('actionElementInnerTextBold')};
        color: ${theme.colors.blackBase};
      }

      & .fi-textarea_optionalText {
        ${theme.typography.bodyTextSmall};
        margin-left: ${theme.spacing.xxs};
      }

      & .fi-textarea_hintText {
        display: block;
        color: ${theme.colors.depthDark1};
        ${theme.typography.bodyTextSmall};
      }

      & .fi-textarea_textarea {
        resize: ${!!resize ? resize : 'vertical'};
        border-radius: 2px;
        border: 1px solid ${theme.colors.depthLight1};
        box-shadow: ${theme.shadows.actionElementBoxShadow};
        padding: 8px 14px 13px 10px;
        margin-top: ${theme.spacing.insetL};

        &:focus {
          ${focus({ theme, noPseudo: true, variant: 'boxShadow' })}
        }
        ::placeholder {
          font-style: italic;
        }
      }

      & .fi-textarea_statusText {
        display: block;
        margin-top: ${theme.spacing.xxs};
        font-size: 14px;
        line-height: 18px;
        font-weight: 600;
      }

      &.fi-textarea--disabled {
        color: ${theme.colors.depthBase};
        ${disabledCursor}

        & .fi-textarea_textarea {
          background-color: ${theme.colors.depthLight3};
        }
      }

      &.fi-textarea--error {
        & .fi-textarea_textarea {
          border: 2px solid ${theme.colors.alertBase};
        }

        & .fi-textarea_statusText {
          color: ${theme.colors.alertBase};
        }
      }
    }
  `,
);
